<?php

namespace Tests\Feature;

use App\Models\PomodoroSession;
use App\Services\GamificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GamificationStreakTest extends TestCase
{
    use RefreshDatabase;

    private GamificationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new GamificationService;
    }

    public function test_no_sessions_returns_zero_streaks(): void
    {
        $streak = $this->service->getStreak();

        $this->assertEquals(0, $streak['current_streak']);
        $this->assertEquals(0, $streak['longest_streak']);
        $this->assertFalse($streak['today_completed']);
    }

    public function test_single_day_returns_streak_of_one(): void
    {
        PomodoroSession::factory()->onDate(today()->toDateString())->create();

        $streak = $this->service->getStreak();

        $this->assertEquals(1, $streak['current_streak']);
        $this->assertEquals(1, $streak['longest_streak']);
        $this->assertTrue($streak['today_completed']);
    }

    public function test_consecutive_days_returns_correct_streak(): void
    {
        // Create sessions for 5 consecutive days ending today
        for ($i = 4; $i >= 0; $i--) {
            PomodoroSession::factory()->onDate(today()->subDays($i)->toDateString())->create();
        }

        $streak = $this->service->getStreak();

        $this->assertEquals(5, $streak['current_streak']);
        $this->assertEquals(5, $streak['longest_streak']);
    }

    public function test_longest_streak_with_gap_in_between(): void
    {
        // 3-day streak (old)
        PomodoroSession::factory()->onDate(today()->subDays(10)->toDateString())->create();
        PomodoroSession::factory()->onDate(today()->subDays(9)->toDateString())->create();
        PomodoroSession::factory()->onDate(today()->subDays(8)->toDateString())->create();

        // gap

        // 2-day streak (recent, ending today)
        PomodoroSession::factory()->onDate(today()->subDays(1)->toDateString())->create();
        PomodoroSession::factory()->onDate(today()->toDateString())->create();

        $streak = $this->service->getStreak();

        $this->assertEquals(2, $streak['current_streak']);
        $this->assertEquals(3, $streak['longest_streak']);
    }

    public function test_broken_streak_resets_current_but_keeps_longest(): void
    {
        // 4-day streak ending 3 days ago
        for ($i = 6; $i >= 3; $i--) {
            PomodoroSession::factory()->onDate(today()->subDays($i)->toDateString())->create();
        }

        // No sessions for days 2, 1, 0 (gap breaks current streak)

        $streak = $this->service->getStreak();

        $this->assertEquals(0, $streak['current_streak']);
        $this->assertEquals(4, $streak['longest_streak']);
    }
}
