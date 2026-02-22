<?php

namespace App\Http\Controllers;

use App\Models\Task;
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
            'settings' => $this->settings->all(),
        ]);
    }
}
