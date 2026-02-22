<?php

namespace App\Http\Controllers;

use App\Enums\SessionType;
use App\Http\Requests\StartSessionRequest;
use App\Models\PomodoroSession;
use App\Services\GamificationService;
use Illuminate\Http\RedirectResponse;

class PomodoroSessionController extends Controller
{
    public function __construct(
        private GamificationService $gamification,
    ) {}

    private const PRAISE_MESSAGES = [
        'Früher Vogel fängt den Wurm! Toller Start, Johanna!',
        'Schon so früh produktiv? Respekt, Johanna!',
        'Der Morgen gehört dir, Johanna! Weiter so!',
        'So früh am Start — Johanna, du bist eine Maschine!',
        'Guten Morgen, Powerfrau! Johanna legt los!',
    ];

    private const NUDGE_MESSAGES = [
        'Na endlich, Johanna! Wurde aber auch langsam Zeit...',
        'Der halbe Tag ist schon rum, Johanna — jetzt aber los!',
        '15 Uhr und der erste Timer? Das geht besser, Johanna!',
        'Besser spät als nie, Johanna... aber nur knapp!',
        'Johanna! Die Uhr tickt — höchste Eisenbahn!',
    ];

    private const BEDTIME_MESSAGES = [
        'Johanna, es ist nach 21 Uhr — Zeit, langsam Feierabend zu machen!',
        'Hey Johanna, dein Bett vermisst dich! Nicht mehr zu lange arbeiten.',
        'Johanna, Schlaf ist auch produktiv! Denk dran, bald aufzuhören.',
        'Es wird spät, Johanna! Noch ein Timer und dann ab ins Bett?',
        'Johanna, die Nachtschicht ist nicht nötig — gönn dir Ruhe!',
    ];

    public function start(StartSessionRequest $request): RedirectResponse
    {
        $running = PomodoroSession::whereNull('ended_at')->first();

        if ($running) {
            return back()->withErrors([
                'timer' => 'Es läuft bereits ein Timer. Bitte beende oder stoppe diesen zuerst.',
            ]);
        }

        $session = PomodoroSession::create([
            ...$request->validated(),
            'started_at' => now(),
        ]);

        $flash = [];

        if (in_array($session->type, [SessionType::Pomodoro, SessionType::Custom]) && now()->hour >= 21) {
            $flash['bedtime'] = self::BEDTIME_MESSAGES[array_rand(self::BEDTIME_MESSAGES)];
        }

        $motivation = $this->getMotivationFlash($session);
        if ($motivation) {
            $flash['motivation'] = $motivation;
        }

        return empty($flash) ? back() : back()->with($flash);
    }

    private function getMotivationFlash(PomodoroSession $session): ?array
    {
        if (! in_array($session->type, [SessionType::Pomodoro, SessionType::Custom])) {
            return null;
        }

        $hasEarlierToday = PomodoroSession::where('id', '!=', $session->id)
            ->whereIn('type', [SessionType::Pomodoro, SessionType::Custom])
            ->whereDate('started_at', today())
            ->exists();

        if ($hasEarlierToday) {
            return null;
        }

        $hour = now()->hour;

        if ($hour < 11) {
            return [
                'type' => 'praise',
                'message' => self::PRAISE_MESSAGES[array_rand(self::PRAISE_MESSAGES)],
            ];
        }

        if ($hour >= 15 && $hour < 21) {
            return [
                'type' => 'nudge',
                'message' => self::NUDGE_MESSAGES[array_rand(self::NUDGE_MESSAGES)],
            ];
        }

        return null;
    }

    public function complete(PomodoroSession $session): RedirectResponse
    {
        $session->update([
            'ended_at' => now(),
            'is_completed' => true,
        ]);

        $newAchievements = $this->gamification->checkAchievements();

        if (!empty($newAchievements)) {
            $achievementData = array_map(fn ($a) => [
                'name' => $a->name,
                'description' => $a->description,
                'icon' => $a->icon,
                'tier' => $a->tier,
            ], $newAchievements);

            return back()->with('new_achievements', $achievementData);
        }

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
