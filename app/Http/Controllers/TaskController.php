<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReorderTasksRequest;
use App\Http\Requests\TaskRequest;
use App\Models\Category;
use App\Models\PomodoroSession;
use App\Models\Task;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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
            'categories' => Category::whereNull('parent_id')->ordered()->with('children')->get(),
            'settings' => $this->settings->all(),
        ]);
    }

    public function store(TaskRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $categoryId = $validated['category_id'] ?? null;

        $minOrder = Task::query()
            ->where('is_completed', false)
            ->when($categoryId !== null,
                fn ($q) => $q->where('category_id', $categoryId),
                fn ($q) => $q->whereNull('category_id'),
            )
            ->min('sort_order');

        if ($minOrder !== null) {
            Task::where('sort_order', '>=', $minOrder)->increment('sort_order');
            $newOrder = $minOrder;
        } else {
            $newOrder = (Task::max('sort_order') ?? 0) + 1;
        }

        Task::create([...$validated, 'sort_order' => $newOrder]);

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

    public function toggleComplete(Request $request, Task $task): RedirectResponse
    {
        $wasCompleted = $task->is_completed;

        $task->update([
            'is_completed' => !$wasCompleted,
            'completed_at' => !$wasCompleted ? now() : null,
        ]);

        if (!$wasCompleted) {
            // Complete running sessions with actual elapsed time
            $runningSessions = PomodoroSession::where('task_id', $task->id)
                ->whereNull('ended_at')
                ->get();

            // Prefer client-provided elapsed time (accurate even when timer was paused)
            $clientElapsed = $request->filled('elapsed_minutes')
                ? max(1, (int) $request->elapsed_minutes)
                : null;

            foreach ($runningSessions as $session) {
                $elapsed = $clientElapsed ?? max(1, (int) round(
                    now()->diffInSeconds(Carbon::parse($session->started_at)) / 60
                ));
                $session->update([
                    'ended_at' => now(),
                    'is_completed' => true,
                    'duration_minutes' => min($elapsed, $session->duration_minutes),
                ]);
            }

            // Create session from manually entered time
            if ($request->filled('manual_minutes') && (int) $request->manual_minutes > 0) {
                PomodoroSession::create([
                    'task_id' => $task->id,
                    'duration_minutes' => (int) $request->manual_minutes,
                    'type' => 'custom',
                    'started_at' => now()->subMinutes((int) $request->manual_minutes),
                    'ended_at' => now(),
                    'is_completed' => true,
                ]);
            }
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
