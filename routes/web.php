<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DailyGoalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\PomodoroSessionController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

// Dashboard
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// Tasks
Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
Route::patch('/tasks/{task}/toggle', [TaskController::class, 'toggleComplete'])->name('tasks.toggle');
Route::post('/tasks/reorder', [TaskController::class, 'reorder'])->name('tasks.reorder');

// Categories
Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
Route::post('/categories/reorder', [CategoryController::class, 'reorder'])->name('categories.reorder');

// Pomodoro Sessions
Route::post('/sessions', [PomodoroSessionController::class, 'start'])->name('sessions.start');
Route::patch('/sessions/{session}/complete', [PomodoroSessionController::class, 'complete'])->name('sessions.complete');
Route::patch('/sessions/{session}/cancel', [PomodoroSessionController::class, 'cancel'])->name('sessions.cancel');

// Daily Goal
Route::post('/daily-goal', [DailyGoalController::class, 'store'])->name('daily-goal.store');
Route::delete('/daily-goal', [DailyGoalController::class, 'destroy'])->name('daily-goal.destroy');

// Settings
Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');
