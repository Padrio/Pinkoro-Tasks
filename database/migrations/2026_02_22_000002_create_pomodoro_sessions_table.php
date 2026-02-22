<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pomodoro_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('duration_minutes');
            $table->string('type');
            $table->dateTime('started_at');
            $table->dateTime('ended_at')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamps();

            $table->index('task_id');
            $table->index('started_at');
            $table->index(['type', 'is_completed', 'started_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pomodoro_sessions');
    }
};
