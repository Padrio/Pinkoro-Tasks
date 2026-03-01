<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Services\GamificationService;
use App\Services\SettingsService;
use App\Services\StatisticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private StatisticsService $statistics,
        private SettingsService $settings,
        private GamificationService $gamification,
    ) {}

    public function index(Request $request): Response
    {
        $period = $request->get('period', '7days');
        $stats = $this->statistics->forPeriod($period);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'period' => $period,
            'recentTasks' => Task::with('pomodoroSessions')
                ->latest()
                ->limit(5)
                ->get(),
            'incompleteTasks' => Task::incomplete()->ordered()
                ->withCount(['pomodoroSessions as pomodoro_count' => function ($q) {
                    $q->where('is_completed', true)->whereIn('type', ['pomodoro', 'custom']);
                }])
                ->withSum(['pomodoroSessions as actual_minutes' => function ($q) {
                    $q->where('is_completed', true);
                }], 'duration_minutes')
                ->get(),
            'urgentTasks' => [
                'overdue' => Task::overdue()->ordered()->get(),
                'due_today' => Task::dueToday()->ordered()->get(),
                'due_soon' => Task::dueSoon(3)->ordered()->get(),
            ],
            'settings' => $this->settings->all(),
            'streak' => $this->gamification->getStreak(),
            'level' => $this->gamification->getLevel(),
            'score' => $this->gamification->getProductivityScore($period),
            'achievements' => $this->gamification->getUnlockedAchievements(),
        ]);
    }
}
