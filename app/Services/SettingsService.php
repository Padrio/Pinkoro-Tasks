<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    public function defaults(): array
    {
        return [
            'pomodoro_duration' => 25,
            'short_break_duration' => 5,
            'long_break_duration' => 15,
            'sound_enabled' => true,
            'sound_volume' => 80,
        ];
    }

    public function all(): array
    {
        return Cache::remember('settings', 60, function () {
            $stored = Setting::pluck('value', 'key')->toArray();
            return array_merge($this->defaults(), $stored);
        });
    }

    public function get(string $key): mixed
    {
        return $this->all()[$key] ?? null;
    }

    public function set(array $values): void
    {
        foreach ($values as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value],
            );
        }

        Cache::forget('settings');
    }
}
