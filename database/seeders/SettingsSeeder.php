<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'pomodoro_duration' => 25,
            'short_break_duration' => 5,
            'long_break_duration' => 15,
            'sound_enabled' => true,
            'sound_volume' => 80,
        ];

        foreach ($defaults as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value],
            );
        }
    }
}
