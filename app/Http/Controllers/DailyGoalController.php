<?php

namespace App\Http\Controllers;

use App\Http\Requests\DailyGoalRequest;
use App\Models\DailyGoal;
use App\Models\Task;

class DailyGoalController extends Controller
{
    public function store(DailyGoalRequest $request)
    {
        $goal = DailyGoal::updateOrCreate(
            ['date' => today()],
            ['end_time' => $request->input('end_time')],
        );

        $maxOrder = Task::query()->max('sort_order') ?? 0;

        $syncData = [];
        foreach ($request->input('tasks', []) as $index => $taskData) {
            $taskId = $taskData['task_id'] ?? null;

            if (! $taskId && ! empty($taskData['title'])) {
                $task = Task::create([
                    'title' => $taskData['title'],
                    'category_id' => $taskData['category_id'] ?? null,
                    'sort_order' => ++$maxOrder,
                ]);
                $taskId = $task->id;
            }

            if ($taskId) {
                $syncData[$taskId] = [
                    'sort_order' => $index,
                    'time_slot_start' => $taskData['time_slot_start'] ?? null,
                    'time_slot_end' => $taskData['time_slot_end'] ?? null,
                ];
            }
        }

        $goal->tasks()->sync($syncData);

        return back();
    }

    public function destroy()
    {
        DailyGoal::where('date', today())->delete();

        return back();
    }

    public static function todayForSharing(): ?array
    {
        return DailyGoal::forToday();
    }
}
