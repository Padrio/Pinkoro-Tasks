<?php

namespace App\Http\Controllers;

use App\Http\Requests\DailyGoalRequest;
use App\Models\DailyGoal;

class DailyGoalController extends Controller
{
    public function store(DailyGoalRequest $request)
    {
        $goal = DailyGoal::updateOrCreate(
            ['date' => today()],
            ['end_time' => $request->input('end_time')],
        );

        $syncData = [];
        foreach ($request->input('tasks', []) as $index => $taskData) {
            $syncData[$taskData['task_id']] = [
                'sort_order' => $index,
                'time_slot_start' => $taskData['time_slot_start'] ?? null,
                'time_slot_end' => $taskData['time_slot_end'] ?? null,
            ];
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
