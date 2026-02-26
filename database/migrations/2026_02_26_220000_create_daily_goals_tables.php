<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_goals', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->string('end_time', 5)->nullable();
            $table->timestamps();
        });

        Schema::create('daily_goal_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_goal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->integer('sort_order')->default(0);
            $table->string('time_slot_start', 5)->nullable();
            $table->string('time_slot_end', 5)->nullable();
            $table->timestamps();

            $table->unique(['daily_goal_id', 'task_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_goal_tasks');
        Schema::dropIfExists('daily_goals');
    }
};
