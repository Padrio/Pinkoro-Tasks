import { Config } from 'ziggy-js';

export interface Task {
    id: number;
    title: string;
    description: string | null;
    is_completed: boolean;
    completed_at: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
    pomodoro_count?: number;
    pomodoro_sessions?: PomodoroSession[];
}

export interface PomodoroSession {
    id: number;
    task_id: number;
    duration_minutes: number;
    type: 'pomodoro' | 'short_break' | 'long_break' | 'custom';
    started_at: string;
    ended_at: string | null;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
    task?: Task;
}

export interface Settings {
    pomodoro_duration: number;
    short_break_duration: number;
    long_break_duration: number;
    sound_enabled: boolean;
    sound_volume: number;
}

export interface DashboardStats {
    tasks_total: number;
    tasks_completed: number;
    total_sessions: number;
    pomodoro_count: number;
    pomodoro_minutes: number;
    total_minutes: number;
    avg_pomodoros_per_task: number;
    avg_minutes_per_session: number;
    daily: DailyStats[];
}

export interface DailyStats {
    date: string;
    tasks_completed: number;
    pomodoro_minutes: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerState {
    taskId: number | null;
    taskTitle: string;
    sessionId: number | null;
    totalSeconds: number;
    remainingSeconds: number;
    status: TimerStatus;
    type: 'pomodoro' | 'short_break' | 'long_break' | 'custom';
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    ziggy: Config & { location: string };
};
