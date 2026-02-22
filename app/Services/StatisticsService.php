<?php

namespace App\Services;

use App\Enums\SessionType;
use App\Models\Category;
use App\Models\PomodoroSession;
use App\Models\Task;
use Illuminate\Support\Carbon;

class StatisticsService
{
    public function forPeriod(string $period): array
    {
        $taskQuery = Task::query();
        $sessionQuery = PomodoroSession::query()->inPeriod($period);

        if ($period === 'today') {
            $taskQuery->whereDate('created_at', today());
        } elseif ($period === '7days') {
            $taskQuery->where('created_at', '>=', now()->subDays(7));
        } elseif ($period === '30days') {
            $taskQuery->where('created_at', '>=', now()->subDays(30));
        }

        $taskStats = Task::query()
            ->when($period !== 'all', function ($q) use ($period) {
                return match ($period) {
                    'today' => $q->whereDate('completed_at', today()),
                    '7days' => $q->where('completed_at', '>=', now()->subDays(7)),
                    '30days' => $q->where('completed_at', '>=', now()->subDays(30)),
                    default => $q,
                };
            })
            ->selectRaw('COUNT(CASE WHEN is_completed = 1 THEN 1 END) as completed')
            ->first();

        $totalTasks = match ($period) {
            'today' => Task::whereDate('created_at', today())->count(),
            '7days' => Task::where('created_at', '>=', now()->subDays(7))->count(),
            '30days' => Task::where('created_at', '>=', now()->subDays(30))->count(),
            default => Task::count(),
        };

        $sessionStats = PomodoroSession::query()
            ->inPeriod($period)
            ->completed()
            ->selectRaw('COUNT(*) as total_sessions')
            ->selectRaw('COUNT(CASE WHEN type IN (?, ?) THEN 1 END) as pomodoro_count', [SessionType::Pomodoro->value, SessionType::Custom->value])
            ->selectRaw('SUM(CASE WHEN type IN (?, ?) THEN duration_minutes ELSE 0 END) as pomodoro_minutes', [SessionType::Pomodoro->value, SessionType::Custom->value])
            ->selectRaw('SUM(duration_minutes) as total_minutes')
            ->first();

        $pomodoroCount = (int) ($sessionStats->pomodoro_count ?? 0);
        $completedTasks = (int) ($taskStats->completed ?? 0);

        return [
            'tasks_total' => $totalTasks,
            'tasks_completed' => $completedTasks,
            'total_sessions' => (int) ($sessionStats->total_sessions ?? 0),
            'pomodoro_count' => $pomodoroCount,
            'pomodoro_minutes' => (int) ($sessionStats->pomodoro_minutes ?? 0),
            'total_minutes' => (int) ($sessionStats->total_minutes ?? 0),
            'avg_pomodoros_per_task' => $completedTasks > 0
                ? round($pomodoroCount / $completedTasks, 1) : 0,
            'avg_minutes_per_session' => $pomodoroCount > 0
                ? round((int) ($sessionStats->pomodoro_minutes ?? 0) / $pomodoroCount, 1) : 0,
            'daily' => $this->dailyBreakdown($period),
            'category_breakdown' => $this->categoryBreakdown($period),
            'pomodoro_breakdown' => $this->pomodoroBreakdown($period),
        ];
    }

    private function categoryBreakdown(string $period): array
    {
        $categories = Category::ordered()->get();
        $breakdown = [];

        foreach ($categories as $category) {
            $breakdown[] = $this->categoryStats($category->id, $category->name, $period);
        }

        // "Ohne Kategorie" for uncategorized tasks
        $breakdown[] = $this->categoryStats(null, 'Ohne Kategorie', $period);

        return $breakdown;
    }

    private function categoryStats(?int $categoryId, string $categoryName, string $period): array
    {
        $tasksCompleted = Task::query()
            ->where('is_completed', true)
            ->when($categoryId !== null,
                fn ($q) => $q->where('category_id', $categoryId),
                fn ($q) => $q->whereNull('category_id'),
            )
            ->when($period !== 'all', function ($q) use ($period) {
                return match ($period) {
                    'today' => $q->whereDate('completed_at', today()),
                    '7days' => $q->where('completed_at', '>=', now()->subDays(7)),
                    '30days' => $q->where('completed_at', '>=', now()->subDays(30)),
                    default => $q,
                };
            })
            ->count();

        $sessionStats = PomodoroSession::query()
            ->inPeriod($period)
            ->completed()
            ->whereHas('task', function ($q) use ($categoryId) {
                if ($categoryId !== null) {
                    $q->where('category_id', $categoryId);
                } else {
                    $q->whereNull('category_id');
                }
            })
            ->selectRaw('COUNT(CASE WHEN type IN (?, ?) THEN 1 END) as pomodoro_count', [SessionType::Pomodoro->value, SessionType::Custom->value])
            ->selectRaw('SUM(CASE WHEN type IN (?, ?) THEN duration_minutes ELSE 0 END) as pomodoro_minutes', [SessionType::Pomodoro->value, SessionType::Custom->value])
            ->first();

        $estimatedMinutes = (int) Task::query()
            ->where('is_completed', true)
            ->when($categoryId !== null,
                fn ($q) => $q->where('category_id', $categoryId),
                fn ($q) => $q->whereNull('category_id'),
            )
            ->when($period !== 'all', function ($q) use ($period) {
                return match ($period) {
                    'today' => $q->whereDate('completed_at', today()),
                    '7days' => $q->where('completed_at', '>=', now()->subDays(7)),
                    '30days' => $q->where('completed_at', '>=', now()->subDays(30)),
                    default => $q,
                };
            })
            ->sum('estimated_minutes');

        $actualMinutes = (int) ($sessionStats->pomodoro_minutes ?? 0);

        return [
            'category_id' => $categoryId,
            'category_name' => $categoryName,
            'tasks_completed' => $tasksCompleted,
            'pomodoro_count' => (int) ($sessionStats->pomodoro_count ?? 0),
            'pomodoro_minutes' => $actualMinutes,
            'estimated_minutes_total' => $estimatedMinutes,
            'actual_minutes_total' => $actualMinutes,
            'accuracy_ratio' => $estimatedMinutes > 0
                ? round($actualMinutes / $estimatedMinutes, 2) : null,
        ];
    }

    private function pomodoroBreakdown(string $period): array
    {
        return PomodoroSession::query()
            ->inPeriod($period)
            ->completed()
            ->workSessions()
            ->with('task:id,title')
            ->orderByDesc('started_at')
            ->get()
            ->map(fn ($session) => [
                'task_title' => $session->task?->title ?? 'Unbekannt',
                'duration_minutes' => $session->duration_minutes,
                'started_at' => $session->started_at->format('d.m. H:i'),
            ])
            ->all();
    }

    private function dailyBreakdown(string $period): array
    {
        $days = match ($period) {
            'today' => 1,
            '7days' => 7,
            '30days' => 30,
            default => 30,
        };

        $startDate = now()->subDays($days - 1)->startOfDay();

        $daily = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $dateStr = $date->toDateString();

            $tasksCompleted = Task::whereDate('completed_at', $dateStr)->count();
            $pomodoroMinutes = (int) PomodoroSession::query()
                ->completed()
                ->workSessions()
                ->whereDate('started_at', $dateStr)
                ->sum('duration_minutes');

            $daily[] = [
                'date' => $dateStr,
                'tasks_completed' => $tasksCompleted,
                'pomodoro_minutes' => $pomodoroMinutes,
            ];
        }

        return $daily;
    }
}
