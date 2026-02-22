<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
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
    ];

    protected function casts(): array
    {
        return [
            'is_completed' => 'boolean',
            'completed_at' => 'datetime',
        ];
    }

    public function pomodoroSessions(): HasMany
    {
        return $this->hasMany(PomodoroSession::class);
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
}
