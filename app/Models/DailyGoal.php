<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class DailyGoal extends Model
{
    protected $fillable = ['date', 'end_time'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'daily_goal_tasks')
            ->withPivot('sort_order', 'time_slot_start', 'time_slot_end')
            ->orderByPivot('sort_order');
    }

    public static function forToday(): ?array
    {
        $goal = static::where('date', today())
            ->with(['tasks' => function ($query) {
                $query->withCount(['pomodoroSessions as pomodoro_count' => function ($q) {
                    $q->where('is_completed', true)->where('type', 'pomodoro');
                }])
                ->withSum(['pomodoroSessions as actual_minutes' => function ($q) {
                    $q->where('is_completed', true);
                }], 'duration_minutes');
            }])
            ->first();

        if (!$goal) {
            return null;
        }

        $tasks = $goal->tasks->map(fn (Task $task) => [
            'id' => $task->id,
            'title' => $task->title,
            'is_completed' => $task->is_completed,
            'priority' => $task->priority,
            'estimated_minutes' => $task->estimated_minutes,
            'actual_minutes' => (int) ($task->actual_minutes ?? 0),
            'sort_order' => $task->pivot->sort_order,
            'time_slot_start' => $task->pivot->time_slot_start,
            'time_slot_end' => $task->pivot->time_slot_end,
        ]);

        return [
            'id' => $goal->id,
            'date' => $goal->date->toDateString(),
            'end_time' => $goal->end_time,
            'completed_count' => $tasks->where('is_completed', true)->count(),
            'total_count' => $tasks->count(),
            'tasks' => $tasks->values()->all(),
        ];
    }
}
