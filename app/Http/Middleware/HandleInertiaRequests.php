<?php

namespace App\Http\Middleware;

use App\Models\PomodoroSession;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'settings' => fn () => app(SettingsService::class)->all(),
            'activeSession' => fn () => PomodoroSession::whereNull('ended_at')
                ->with('task')
                ->first(),
            'flash' => fn () => [
                'motivation' => $request->session()->get('motivation'),
                'bedtime' => $request->session()->get('bedtime'),
                'new_achievements' => $request->session()->get('new_achievements'),
            ],
        ];
    }
}
