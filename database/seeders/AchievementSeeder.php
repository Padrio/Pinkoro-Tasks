<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            [
                'key' => 'first_pomodoro',
                'name' => 'Erster Schritt',
                'description' => 'Schließe deinen ersten Pomodoro ab',
                'icon' => 'rocket',
                'tier' => 'bronze',
                'threshold' => 1,
            ],
            [
                'key' => 'pomodoro_10',
                'name' => 'Fleißig',
                'description' => 'Schließe 10 Pomodoros ab',
                'icon' => 'zap',
                'tier' => 'bronze',
                'threshold' => 10,
            ],
            [
                'key' => 'pomodoro_50',
                'name' => 'Marathon-Fokus',
                'description' => 'Schließe 50 Pomodoros ab',
                'icon' => 'flame',
                'tier' => 'silver',
                'threshold' => 50,
            ],
            [
                'key' => 'pomodoro_100',
                'name' => 'Centurion',
                'description' => 'Schließe 100 Pomodoros ab',
                'icon' => 'crown',
                'tier' => 'gold',
                'threshold' => 100,
            ],
            [
                'key' => 'streak_3',
                'name' => 'Drei-Tage-Feuer',
                'description' => 'Halte einen 3-Tage-Streak',
                'icon' => 'flame',
                'tier' => 'bronze',
                'threshold' => 3,
            ],
            [
                'key' => 'streak_7',
                'name' => 'Wochen-Krieger',
                'description' => 'Halte einen 7-Tage-Streak',
                'icon' => 'shield',
                'tier' => 'silver',
                'threshold' => 7,
            ],
            [
                'key' => 'streak_30',
                'name' => 'Monats-Legende',
                'description' => 'Halte einen 30-Tage-Streak',
                'icon' => 'trophy',
                'tier' => 'gold',
                'threshold' => 30,
            ],
            [
                'key' => 'tasks_10',
                'name' => 'Task-Killer',
                'description' => 'Schließe 10 Tasks ab',
                'icon' => 'check-circle',
                'tier' => 'bronze',
                'threshold' => 10,
            ],
            [
                'key' => 'tasks_50',
                'name' => 'Aufräumer',
                'description' => 'Schließe 50 Tasks ab',
                'icon' => 'star',
                'tier' => 'silver',
                'threshold' => 50,
            ],
            [
                'key' => 'focus_hour',
                'name' => 'Fokus-Stunde',
                'description' => 'Fokussiere 60 Minuten an einem Tag',
                'icon' => 'clock',
                'tier' => 'silver',
                'threshold' => 60,
            ],
            [
                'key' => 'early_bird',
                'name' => 'Frühaufsteher',
                'description' => 'Starte einen Pomodoro vor 7:00 Uhr',
                'icon' => 'sunrise',
                'tier' => 'bronze',
                'threshold' => 1,
            ],
            [
                'key' => 'night_owl',
                'name' => 'Nachteule',
                'description' => 'Starte einen Pomodoro nach 22:00 Uhr',
                'icon' => 'moon',
                'tier' => 'bronze',
                'threshold' => 1,
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(
                ['key' => $achievement['key']],
                $achievement,
            );
        }
    }
}
