import { Config } from 'ziggy-js';

export interface Category {
    id: number;
    name: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    is_completed: boolean;
    completed_at: string | null;
    sort_order: number;
    category_id: number | null;
    deadline: string | null;
    estimated_minutes: number | null;
    created_at: string;
    updated_at: string;
    pomodoro_count?: number;
    actual_minutes?: number;
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

export type TimerDisplayMode = 'ring_time' | 'ring_percent' | 'ring_only' | 'bar' | 'liquid';

export type SoundId =
    | 'glockenspiel'
    | 'sanfter_dreiklang'
    | 'aufstieg'
    | 'glocke'
    | 'doppelton'
    | 'abschluss'
    | 'harfe'
    | 'tropfen'
    | 'keine';

export interface Settings {
    pomodoro_duration: number;
    short_break_duration: number;
    long_break_duration: number;
    sound_enabled: boolean;
    sound_volume: number;
    timer_display_mode: TimerDisplayMode;
    pomodoros_per_set: number;
    sound_pomodoro_end: SoundId;
    sound_break_end: SoundId;
    sound_task_complete: SoundId;
}

export interface CategoryBreakdown {
    category_id: number | null;
    category_name: string;
    tasks_completed: number;
    pomodoro_count: number;
    pomodoro_minutes: number;
    estimated_minutes_total: number;
    actual_minutes_total: number;
    accuracy_ratio: number | null;
}

export interface UrgentTasks {
    overdue: Task[];
    due_today: Task[];
    due_soon: Task[];
}

export interface PomodoroBreakdownItem {
    task_title: string;
    duration_minutes: number;
    started_at: string;
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
    category_breakdown: CategoryBreakdown[];
    pomodoro_breakdown: PomodoroBreakdownItem[];
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
