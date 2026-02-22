<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReorderTasksRequest;
use App\Http\Requests\TaskRequest;
use App\Models\Category;
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
                    $q->whereIn('type', ['pomodoro', 'custom'])->where('is_completed', true);
                }])
                ->withSum(['pomodoroSessions as actual_minutes' => function ($q) {
                    $q->whereIn('type', ['pomodoro', 'custom'])->where('is_completed', true);
                }], 'duration_minutes')
                ->get(),
            'categories' => Category::ordered()->get(),
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
        $wasCompleted = $task->is_completed;

        $task->update([
            'is_completed' => !$wasCompleted,
            'completed_at' => !$wasCompleted ? now() : null,
        ]);

        // Cancel any running sessions when marking a task as completed
        if (!$wasCompleted) {
            PomodoroSession::where('task_id', $task->id)
                ->whereNull('ended_at')
                ->update([
                    'ended_at' => now(),
                    'is_completed' => false,
                ]);
        }

        return back();
    }

    public function reorder(ReorderTasksRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            foreach ($request->order as $index => $item) {
                Task::where('id', $item['id'])->update([
                    'sort_order' => $index,
                    'category_id' => $item['category_id'] ?? null,
                ]);
            }
        });

        return back();
    }
}
