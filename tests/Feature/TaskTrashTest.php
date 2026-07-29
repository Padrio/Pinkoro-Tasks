<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\PomodoroSession;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTrashTest extends TestCase
{
    use RefreshDatabase;

    public function test_destroy_moves_task_to_trash_instead_of_deleting_it(): void
    {
        $task = Task::create(['title' => 'Zu löschen', 'sort_order' => 0]);

        $response = $this->delete(route('tasks.destroy', $task->id));

        $response->assertRedirect();
        $this->assertSoftDeleted('tasks', ['id' => $task->id]);
    }

    public function test_trashed_task_disappears_from_the_active_list(): void
    {
        $active = Task::create(['title' => 'Aktiv', 'sort_order' => 0]);
        $trashed = Task::create(['title' => 'Im Papierkorb', 'sort_order' => 1]);
        $trashed->delete();

        $response = $this->get(route('tasks.index'));

        $response->assertInertia(fn ($page) => $page
            ->has('tasks', 1)
            ->where('tasks.0.id', $active->id)
            ->has('trashedTasks', 1)
            ->where('trashedTasks.0.id', $trashed->id)
        );
    }

    public function test_trashed_tasks_are_listed_newest_first(): void
    {
        $older = Task::create(['title' => 'Zuerst gelöscht', 'sort_order' => 0]);
        $newer = Task::create(['title' => 'Zuletzt gelöscht', 'sort_order' => 1]);

        $this->travelTo(now()->subDay(), fn () => $older->delete());
        $newer->delete();

        $response = $this->get(route('tasks.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('trashedTasks.0.id', $newer->id)
            ->where('trashedTasks.1.id', $older->id)
        );
    }

    public function test_restore_brings_a_task_back_into_its_category(): void
    {
        $category = Category::create(['name' => 'Arbeit', 'sort_order' => 0]);
        $task = Task::create(['title' => 'Wiederherstellen', 'sort_order' => 0, 'category_id' => $category->id]);
        $task->delete();

        $response = $this->post(route('tasks.restore', $task->id));

        $response->assertRedirect();
        $this->assertNotSoftDeleted('tasks', ['id' => $task->id]);
        $this->assertEquals($category->id, $task->fresh()->category_id);
    }

    public function test_force_destroy_removes_the_task_permanently(): void
    {
        $task = Task::create(['title' => 'Endgültig weg', 'sort_order' => 0]);
        $task->delete();

        $response = $this->delete(route('tasks.force-destroy', $task->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_force_destroy_also_removes_the_recorded_pomodoro_sessions(): void
    {
        $task = Task::create(['title' => 'Mit Zeiten', 'sort_order' => 0]);
        $session = PomodoroSession::create([
            'task_id' => $task->id,
            'duration_minutes' => 25,
            'type' => 'pomodoro',
            'started_at' => now()->subMinutes(25),
            'ended_at' => now(),
            'is_completed' => true,
        ]);
        $task->delete();

        $this->delete(route('tasks.force-destroy', $task->id));

        $this->assertDatabaseMissing('pomodoro_sessions', ['id' => $session->id]);
    }

    public function test_trashing_a_task_keeps_its_pomodoro_sessions(): void
    {
        $task = Task::create(['title' => 'Mit Zeiten', 'sort_order' => 0]);
        $session = PomodoroSession::create([
            'task_id' => $task->id,
            'duration_minutes' => 25,
            'type' => 'pomodoro',
            'started_at' => now()->subMinutes(25),
            'ended_at' => now(),
            'is_completed' => true,
        ]);

        $this->delete(route('tasks.destroy', $task->id));

        $this->assertDatabaseHas('pomodoro_sessions', ['id' => $session->id]);
    }

    public function test_empty_trash_purges_only_trashed_tasks(): void
    {
        $active = Task::create(['title' => 'Aktiv', 'sort_order' => 0]);
        $firstTrashed = Task::create(['title' => 'Papierkorb 1', 'sort_order' => 1]);
        $secondTrashed = Task::create(['title' => 'Papierkorb 2', 'sort_order' => 2]);
        $firstTrashed->delete();
        $secondTrashed->delete();

        $response = $this->delete(route('tasks.trash.empty'));

        $response->assertRedirect();
        $this->assertDatabaseMissing('tasks', ['id' => $firstTrashed->id]);
        $this->assertDatabaseMissing('tasks', ['id' => $secondTrashed->id]);
        $this->assertDatabaseHas('tasks', ['id' => $active->id]);
    }

    public function test_a_trashed_task_is_hidden_from_the_daily_goal(): void
    {
        $task = Task::create(['title' => 'Tagesziel-Task', 'sort_order' => 0]);

        $this->post(route('daily-goal.store'), [
            'end_time' => '17:00',
            'tasks' => [['task_id' => $task->id, 'time_slot_start' => '09:00', 'time_slot_end' => '10:00']],
        ]);

        $task->delete();

        $response = $this->get(route('dashboard'));

        $response->assertInertia(fn ($page) => $page->where('dailyGoal.total_count', 0));
    }
}
