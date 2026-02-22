<?php

namespace App\Models;

use App\Enums\SessionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class PomodoroSession extends Model
{
    protected $fillable = [
        'task_id',
        'duration_minutes',
        'type',
        'started_at',
        'ended_at',
        'is_completed',
    ];

    protected function casts(): array
    {
        return [
            'type' => SessionType::class,
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'is_completed' => 'boolean',
        ];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('is_completed', true);
    }

    public function scopePomodoros(Builder $query): Builder
    {
        return $query->where('type', SessionType::Pomodoro);
    }

    public function scopeInPeriod(Builder $query, string $period): Builder
    {
        return match ($period) {
            'today' => $query->whereDate('started_at', today()),
            '7days' => $query->where('started_at', '>=', now()->subDays(7)),
            '30days' => $query->where('started_at', '>=', now()->subDays(30)),
            default => $query,
        };
    }
}
