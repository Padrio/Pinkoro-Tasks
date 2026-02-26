<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Task extends Model
{
    protected $fillable = [
        'title',
        'description',
        'is_completed',
        'completed_at',
        'sort_order',
        'category_id',
        'priority',
        'deadline',
        'estimated_minutes',
    ];

    protected function casts(): array
    {
        return [
            'is_completed' => 'boolean',
            'completed_at' => 'datetime',
            'deadline' => 'date',
        ];
    }

    public function pomodoroSessions(): HasMany
    {
        return $this->hasMany(PomodoroSession::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeIncomplete(Builder $query): Builder
    {
        return $query->where('is_completed', false);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('is_completed', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('created_at');
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $query->incomplete()
            ->whereNotNull('deadline')
            ->where('deadline', '<', today());
    }

    public function scopeDueToday(Builder $query): Builder
    {
        return $query->incomplete()
            ->whereDate('deadline', today());
    }

    public function scopeDueSoon(Builder $query, int $days = 3): Builder
    {
        return $query->incomplete()
            ->whereNotNull('deadline')
            ->where('deadline', '>', today())
            ->where('deadline', '<=', today()->addDays($days));
    }
}
