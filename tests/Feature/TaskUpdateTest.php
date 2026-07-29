<?php

namespace Tests\Feature;

use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_update_persists_the_edited_fields(): void
    {
        $task = Task::create(['title' => 'Alter Titel', 'sort_order' => 0]);

        $response = $this->put(route('tasks.update', $task->id), [
            'title' => 'Neuer Titel',
            'description' => 'Neue Beschreibung',
            'priority' => 'high',
            'estimated_minutes' => 45,
        ]);

        $response->assertRedirect();

        $task->refresh();
        $this->assertEquals('Neuer Titel', $task->title);
        $this->assertEquals('Neue Beschreibung', $task->description);
        $this->assertEquals('high', $task->priority);
        $this->assertEquals(45, $task->estimated_minutes);
    }

    /**
     * The task list on the client re-syncs from the server payload by comparing
     * updated_at, so an edit that does not move that timestamp would leave the
     * list showing stale values.
     */
    public function test_editing_a_task_moves_its_updated_at_timestamp(): void
    {
        $task = Task::create(['title' => 'Alter Titel', 'sort_order' => 0]);
        $before = $task->updated_at;

        $this->travelTo(now()->addMinute());
        $this->put(route('tasks.update', $task->id), ['title' => 'Neuer Titel']);

        $this->assertTrue($task->fresh()->updated_at->greaterThan($before));
    }

    public function test_task_index_payload_exposes_updated_at(): void
    {
        $task = Task::create(['title' => 'Sichtbar', 'sort_order' => 0]);

        $response = $this->get(route('tasks.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('tasks.0.id', $task->id)
            ->has('tasks.0.updated_at')
        );
    }

    public function test_index_returns_the_edited_title(): void
    {
        $task = Task::create(['title' => 'Alter Titel', 'sort_order' => 0]);

        $this->put(route('tasks.update', $task->id), ['title' => 'Neuer Titel']);

        $response = $this->get(route('tasks.index'));

        $response->assertInertia(fn ($page) => $page->where('tasks.0.title', 'Neuer Titel'));
    }
}
