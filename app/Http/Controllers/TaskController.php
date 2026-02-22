<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReorderTasksRequest;
use App\Http\Requests\TaskRequest;
use App\Models\PomodoroSession;
use App\Models\Task;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function __construct(
        private SettingsService $settings,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Tasks', [
            'tasks' => Task::ordered()
                ->withCount(['pomodoroSessions as pomodoro_count' => function ($q) {
                    $q->where('type', 'pomodoro')->where('is_completed', true);
                }])
                ->get(),
            'activeSession' => PomodoroSession::whereNull('ended_at')
                ->with('task')
                ->first(),
            'settings' => $this->settings->all(),
        ]);
    }

    public function store(TaskRequest $request): RedirectResponse
    {
        $maxOrder = Task::max('sort_order') ?? 0;

        Task::create([
            ...$request->validated(),
            'sort_order' => $maxOrder + 1,
        ]);

        return back();
    }

    public function update(TaskRequest $request, Task $task): RedirectResponse
    {
        $task->update($request->validated());

        return back();
    }

    public function destroy(Task $task): RedirectResponse
    {
        $task->delete();

        return back();
    }

    public function toggleComplete(Task $task): RedirectResponse
    {
        $task->update([
            'is_completed' => !$task->is_completed,
            'completed_at' => !$task->is_completed ? now() : null,
        ]);

        return back();
    }

    public function reorder(ReorderTasksRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            foreach ($request->order as $index => $id) {
                Task::where('id', $id)->update(['sort_order' => $index]);
            }
        });

        return back();
    }
}
