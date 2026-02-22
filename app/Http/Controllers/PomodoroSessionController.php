<?php

namespace App\Http\Controllers;

use App\Http\Requests\StartSessionRequest;
use App\Models\PomodoroSession;
use Illuminate\Http\RedirectResponse;

class PomodoroSessionController extends Controller
{
    public function start(StartSessionRequest $request): RedirectResponse
    {
        $running = PomodoroSession::whereNull('ended_at')->first();

        if ($running) {
            return back()->withErrors([
                'timer' => 'Es läuft bereits ein Timer. Bitte beende oder stoppe diesen zuerst.',
            ]);
        }

        PomodoroSession::create([
            ...$request->validated(),
            'started_at' => now(),
        ]);

        return back();
    }

    public function complete(PomodoroSession $session): RedirectResponse
    {
        $session->update([
            'ended_at' => now(),
            'is_completed' => true,
        ]);

        return back();
    }

    public function cancel(PomodoroSession $session): RedirectResponse
    {
        $session->update([
            'ended_at' => now(),
            'is_completed' => false,
        ]);

        return back();
    }
}
