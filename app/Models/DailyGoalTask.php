<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class DailyGoalTask extends Pivot
{
    protected $table = 'daily_goal_tasks';

    protected $fillable = [
        'daily_goal_id',
        'task_id',
        'sort_order',
        'time_slot_start',
        'time_slot_end',
    ];
}
