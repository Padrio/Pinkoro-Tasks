<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\DailyGoal;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DailyGoalTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_with_existing_tasks(): void
    {
        $task = Task::create(['title' => 'Existing Task', 'sort_order' => 0]);

        $response = $this->post(route('daily-goal.store'), [
            'end_time' => '17:00',
            'tasks' => [
                [
                    'task_id' => $task->id,
                    'time_slot_start' => '09:00',
                    'time_slot_end' => '10:00',
                ],
            ],
        ]);

        $response->assertRedirect();

        $goal = DailyGoal::where('date', today())->first();
        $this->assertNotNull($goal);
        $this->assertEquals('17:00', $goal->end_time);
        $this->assertCount(1, $goal->tasks);
        $this->assertEquals($task->id, $goal->tasks->first()->id);
    }

    public function test_store_creates_new_ad_hoc_task(): void
    {
        $response = $this->post(route('daily-goal.store'), [
            'end_time' => null,
            'tasks' => [
                [
                    'title' => 'Brand New Task',
                    'time_slot_start' => '10:00',
                    'time_slot_end' => '11:00',
                ],
            ],
        ]);

        $response->assertRedirect();

        $task = Task::where('title', 'Brand New Task')->first();
        $this->assertNotNull($task);
        $this->assertNull($task->category_id);

        $goal = DailyGoal::where('date', today())->first();
        $this->assertCount(1, $goal->tasks);
        $this->assertEquals($task->id, $goal->tasks->first()->id);
    }

    public function test_store_creates_ad_hoc_task_with_category(): void
    {
        $category = Category::create(['name' => 'Work', 'sort_order' => 0]);

        $response = $this->post(route('daily-goal.store'), [
            'end_time' => null,
            'tasks' => [
                [
                    'title' => 'Categorized Task',
                    'category_id' => $category->id,
                    'time_slot_start' => null,
                    'time_slot_end' => null,
                ],
            ],
        ]);

        $response->assertRedirect();

        $task = Task::where('title', 'Categorized Task')->first();
        $this->assertNotNull($task);
        $this->assertEquals($category->id, $task->category_id);
    }

    public function test_store_mixes_existing_and_new_tasks(): void
    {
        $existingTask = Task::create(['title' => 'Existing', 'sort_order' => 0]);

        $response = $this->post(route('daily-goal.store'), [
            'end_time' => '18:00',
            'tasks' => [
                [
                    'task_id' => $existingTask->id,
                    'time_slot_start' => '09:00',
                    'time_slot_end' => '10:00',
                ],
                [
                    'title' => 'New Task From Plan',
                    'time_slot_start' => '10:00',
                    'time_slot_end' => '11:00',
                ],
            ],
        ]);

        $response->assertRedirect();

        $goal = DailyGoal::where('date', today())->first();
        $this->assertCount(2, $goal->tasks);

        $newTask = Task::where('title', 'New Task From Plan')->first();
        $this->assertNotNull($newTask);
    }

    public function test_store_ignores_task_without_id_or_title(): void
    {
        $response = $this->post(route('daily-goal.store'), [
            'end_time' => null,
            'tasks' => [
                [
                    'time_slot_start' => '09:00',
                    'time_slot_end' => '10:00',
                ],
            ],
        ]);

        $response->assertRedirect();

        $goal = DailyGoal::where('date', today())->first();
        $this->assertCount(0, $goal->tasks);
    }

    public function test_destroy_removes_daily_goal(): void
    {
        $goal = DailyGoal::create(['date' => today(), 'end_time' => '17:00']);
        $task = Task::create(['title' => 'Test Task', 'sort_order' => 0]);
        $goal->tasks()->attach($task->id, ['sort_order' => 0]);

        $response = $this->delete(route('daily-goal.destroy'));

        $response->assertRedirect();
        $this->assertNull(DailyGoal::where('date', today())->first());
    }
}
