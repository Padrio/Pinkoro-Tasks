<?php

namespace Database\Factories;

use App\Enums\SessionType;
use App\Models\PomodoroSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PomodoroSession>
 */
class PomodoroSessionFactory extends Factory
{
    protected $model = PomodoroSession::class;

    public function definition(): array
    {
        $startedAt = $this->faker->dateTimeBetween('-30 days', 'now');

        return [
            'task_id' => null,
            'duration_minutes' => 25,
            'type' => SessionType::Pomodoro,
            'started_at' => $startedAt,
            'ended_at' => (clone $startedAt)->modify('+25 minutes'),
            'is_completed' => true,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn () => ['is_completed' => true]);
    }

    public function onDate(string $date): static
    {
        return $this->state(fn () => [
            'started_at' => $date.' 10:00:00',
            'ended_at' => $date.' 10:25:00',
        ]);
    }
}
