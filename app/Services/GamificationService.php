<?php

namespace App\Services;

use App\Enums\SessionType;
use App\Models\Achievement;
use App\Models\PomodoroSession;
use App\Models\Task;
use App\Models\UserAchievement;
use Illuminate\Support\Carbon;

class GamificationService
{
    private const LEVELS = [
        1 => ['title' => 'Anfänger', 'min_minutes' => 0],
        2 => ['title' => 'Lehrling', 'min_minutes' => 60],
        3 => ['title' => 'Fokus-Adept', 'min_minutes' => 300],
        4 => ['title' => 'Pomodoro-Kenner', 'min_minutes' => 900],
        5 => ['title' => 'Produktivitäts-Held', 'min_minutes' => 1800],
        6 => ['title' => 'Fokus-Meister', 'min_minutes' => 3600],
        7 => ['title' => 'Zen-Meister', 'min_minutes' => 6000],
        8 => ['title' => 'Legende', 'min_minutes' => 12000],
    ];

    public function getStreak(): array
    {
        $dates = PomodoroSession::query()
            ->completed()
            ->workSessions()
            ->selectRaw('DATE(started_at) as session_date')
            ->groupBy('session_date')
            ->orderByDesc('session_date')
            ->pluck('session_date')
            ->map(fn ($d) => Carbon::parse($d)->startOfDay());

        $todayCompleted = $dates->contains(fn ($d) => $d->isToday());

        // Calculate current streak
        $currentStreak = 0;
        $checkDate = $todayCompleted ? today() : today()->subDay();

        foreach ($dates as $date) {
            if ($date->equalTo($checkDate)) {
                $currentStreak++;
                $checkDate = $checkDate->subDay();
            } elseif ($date->lessThan($checkDate)) {
                break;
            }
        }

        // Calculate longest streak
        $longestStreak = 0;
        $streak = 0;
        $prevDate = null;

        foreach ($dates->sortBy(fn ($d) => $d) as $date) {
            if ($prevDate === null || $date->diffInDays($prevDate) === 1) {
                $streak++;
            } else {
                $streak = 1;
            }
            $longestStreak = max($longestStreak, $streak);
            $prevDate = $date;
        }

        return [
            'current_streak' => $currentStreak,
            'longest_streak' => $longestStreak,
            'today_completed' => $todayCompleted,
        ];
    }

    public function getLevel(): array
    {
        $totalMinutes = (int) PomodoroSession::query()
            ->completed()
            ->workSessions()
            ->sum('duration_minutes');

        $currentLevel = 1;
        $currentTitle = self::LEVELS[1]['title'];

        foreach (self::LEVELS as $level => $data) {
            if ($totalMinutes >= $data['min_minutes']) {
                $currentLevel = $level;
                $currentTitle = $data['title'];
            }
        }

        $nextLevel = $currentLevel + 1;
        $nextLevelXp = isset(self::LEVELS[$nextLevel])
            ? self::LEVELS[$nextLevel]['min_minutes']
            : null;

        $currentLevelXp = self::LEVELS[$currentLevel]['min_minutes'];

        return [
            'level' => $currentLevel,
            'title' => $currentTitle,
            'current_xp' => $totalMinutes,
            'current_level_xp' => $currentLevelXp,
            'next_level_xp' => $nextLevelXp,
        ];
    }

    public function getProductivityScore(string $period): int
    {
        $streak = $this->getStreak();
        $streakScore = min(30, $streak['current_streak'] * 5);

        $pomodoroCount = PomodoroSession::query()
            ->completed()
            ->workSessions()
            ->inPeriod($period)
            ->count();

        $dailyTarget = 4;
        $days = match ($period) {
            'today' => 1,
            '7days' => 7,
            '30days' => 30,
            default => 30,
        };
        $avgDaily = $days > 0 ? $pomodoroCount / $days : 0;
        $pomodoroScore = min(40, (int) ($avgDaily / $dailyTarget * 40));

        $totalTasks = Task::query()
            ->when($period !== 'all', function ($q) use ($period) {
                return match ($period) {
                    'today' => $q->whereDate('created_at', today()),
                    '7days' => $q->where('created_at', '>=', now()->subDays(7)),
                    '30days' => $q->where('created_at', '>=', now()->subDays(30)),
                    default => $q,
                };
            })
            ->count();

        $completedTasks = Task::query()
            ->where('is_completed', true)
            ->when($period !== 'all', function ($q) use ($period) {
                return match ($period) {
                    'today' => $q->whereDate('completed_at', today()),
                    '7days' => $q->where('completed_at', '>=', now()->subDays(7)),
                    '30days' => $q->where('completed_at', '>=', now()->subDays(30)),
                    default => $q,
                };
            })
            ->count();

        $completionRate = $totalTasks > 0 ? $completedTasks / $totalTasks : 0;
        $taskScore = (int) ($completionRate * 30);

        return min(100, $streakScore + $pomodoroScore + $taskScore);
    }

    public function checkAchievements(): array
    {
        $newAchievements = [];
        $unlockedKeys = UserAchievement::query()
            ->join('achievements', 'achievements.id', '=', 'user_achievements.achievement_id')
            ->pluck('achievements.key')
            ->toArray();

        $achievements = Achievement::all();

        $totalPomodoros = PomodoroSession::completed()->workSessions()->count();
        $totalCompletedTasks = Task::where('is_completed', true)->count();
        $streak = $this->getStreak();

        $todayMinutes = (int) PomodoroSession::query()
            ->completed()
            ->workSessions()
            ->whereDate('started_at', today())
            ->sum('duration_minutes');

        $hasEarlyBird = PomodoroSession::query()
            ->completed()
            ->workSessions()
            ->whereRaw('CAST(strftime(\'%H\', started_at) AS INTEGER) < 7')
            ->exists();

        $hasNightOwl = PomodoroSession::query()
            ->completed()
            ->workSessions()
            ->whereRaw('CAST(strftime(\'%H\', started_at) AS INTEGER) >= 22')
            ->exists();

        foreach ($achievements as $achievement) {
            if (in_array($achievement->key, $unlockedKeys)) {
                continue;
            }

            $unlocked = match (true) {
                str_starts_with($achievement->key, 'pomodoro_') || $achievement->key === 'first_pomodoro'
                    => $totalPomodoros >= $achievement->threshold,
                str_starts_with($achievement->key, 'streak_')
                    => max($streak['current_streak'], $streak['longest_streak']) >= $achievement->threshold,
                str_starts_with($achievement->key, 'tasks_')
                    => $totalCompletedTasks >= $achievement->threshold,
                $achievement->key === 'focus_hour'
                    => $todayMinutes >= $achievement->threshold,
                $achievement->key === 'early_bird'
                    => $hasEarlyBird,
                $achievement->key === 'night_owl'
                    => $hasNightOwl,
                default => false,
            };

            if ($unlocked) {
                UserAchievement::create([
                    'achievement_id' => $achievement->id,
                    'unlocked_at' => now(),
                ]);
                $newAchievements[] = $achievement;
            }
        }

        return $newAchievements;
    }

    public function getUnlockedAchievements(): array
    {
        $allAchievements = Achievement::all();
        $unlockedIds = UserAchievement::pluck('achievement_id')->toArray();

        return $allAchievements->map(function ($achievement) use ($unlockedIds) {
            return [
                'id' => $achievement->id,
                'key' => $achievement->key,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'icon' => $achievement->icon,
                'tier' => $achievement->tier,
                'unlocked' => in_array($achievement->id, $unlockedIds),
            ];
        })->toArray();
    }
}
