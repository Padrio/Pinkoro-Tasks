import React, { createContext, useContext, useCallback, useRef, useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useSound } from './SoundContext';
import type { PomodoroSession, TimerStatus } from '@/types';

export interface PendingNextTask {
    id: number;
    title: string;
}

interface TimerContextType {
    taskId: number | null;
    taskTitle: string;
    sessionId: number | null;
    totalSeconds: number;
    remainingSeconds: number;
    status: TimerStatus;
    type: 'pomodoro' | 'short_break' | 'long_break' | 'custom';
    pomodoroInSet: number;
    pendingNextTask: PendingNextTask | null;
    startTimer: (params: {
        taskId: number;
        taskTitle: string;
        sessionId: number;
        durationMinutes: number;
        type: 'pomodoro' | 'short_break' | 'long_break' | 'custom';
    }) => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    resetTimer: () => void;
    completeTimer: (options?: { skipServerComplete?: boolean }) => void;
    incrementPomodoro: () => void;
    resetPomodoroSet: () => void;
    setPendingNextTask: (task: PendingNextTask | null) => void;
}

const TimerContext = createContext<TimerContextType>({
    taskId: null,
    taskTitle: '',
    sessionId: null,
    totalSeconds: 0,
    remainingSeconds: 0,
    status: 'idle',
    type: 'pomodoro',
    pomodoroInSet: 0,
    pendingNextTask: null,
    startTimer: () => {},
    pauseTimer: () => {},
    resumeTimer: () => {},
    resetTimer: () => {},
    completeTimer: () => {},
    incrementPomodoro: () => {},
    resetPomodoroSet: () => {},
    setPendingNextTask: () => {},
});

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const { playSound } = useSound();
    const activeSession = (usePage().props as any).activeSession as PomodoroSession | null;
    const [taskId, setTaskId] = useState<number | null>(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [status, setStatus] = useState<TimerStatus>('idle');
    const [type, setType] = useState<'pomodoro' | 'short_break' | 'long_break' | 'custom'>('pomodoro');
    const [pomodoroInSet, setPomodoroInSet] = useState(0);
    const [pendingNextTask, setPendingNextTask] = useState<PendingNextTask | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startedAtRef = useRef<number>(0);
    const pausedRemainingRef = useRef<number>(0);
    const typeRef = useRef<'pomodoro' | 'short_break' | 'long_break' | 'custom'>('pomodoro');
    const sessionIdRef = useRef<number | null>(null);
    const lastBeepSecondRef = useRef<number>(-1);
    const autoCompletedRef = useRef(false);

    // Keep a ref to playSound so the interval always uses the latest version
    const playSoundRef = useRef(playSound);
    useEffect(() => { playSoundRef.current = playSound; }, [playSound]);

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startInterval = useCallback(() => {
        return setInterval(() => {
            const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
            const rem = Math.max(0, pausedRemainingRef.current - elapsed);
            setRemainingSeconds(rem);

            // Countdown beep for last 5 seconds (play once per second)
            if (rem > 0 && rem <= 5 && rem !== lastBeepSecondRef.current) {
                lastBeepSecondRef.current = rem;
                playSoundRef.current(rem === 1 ? 'countdown-beep-last' : 'countdown-beep');
            }

            if (rem <= 0) {
                lastBeepSecondRef.current = -1;
                clearTimer();
                setStatus('completed');
                playSoundRef.current(
                    typeRef.current === 'pomodoro' || typeRef.current === 'custom'
                        ? 'pomodoro-end'
                        : 'break-end',
                );
                // Auto-complete session server-side so time is always recorded.
                // Use fetch() instead of router.patch() so Inertia can't cancel it.
                if (sessionIdRef.current && !autoCompletedRef.current) {
                    autoCompletedRef.current = true;
                    const xsrf = decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    );
                    fetch(route('sessions.complete', sessionIdRef.current), {
                        method: 'PATCH',
                        headers: { 'X-XSRF-TOKEN': xsrf, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        credentials: 'same-origin',
                        redirect: 'manual',
                    }).then(() => {
                        // Refresh Inertia page data so actual_minutes updates immediately
                        router.reload();
                    }).catch(() => {});
                }
            }
        }, 250);
    }, [clearTimer]);

    const startTimer = useCallback(
        (params: {
            taskId: number;
            taskTitle: string;
            sessionId: number;
            durationMinutes: number;
            type: 'pomodoro' | 'short_break' | 'long_break' | 'custom';
            initialElapsedSeconds?: number;
        }) => {
            clearTimer();
            const total = params.durationMinutes * 60;
            const initialRemaining = params.initialElapsedSeconds != null
                ? Math.max(0, total - params.initialElapsedSeconds)
                : total;

            setTaskId(params.taskId);
            setTaskTitle(params.taskTitle);
            setSessionId(params.sessionId);
            setTotalSeconds(total);
            setRemainingSeconds(initialRemaining);
            setType(params.type);
            typeRef.current = params.type;
            sessionIdRef.current = params.sessionId;
            autoCompletedRef.current = false;
            setStatus('running');

            startedAtRef.current = Date.now();
            pausedRemainingRef.current = initialRemaining;
            lastBeepSecondRef.current = -1;

            intervalRef.current = startInterval();
        },
        [clearTimer, startInterval],
    );

    const pauseTimer = useCallback(() => {
        if (status !== 'running') return;
        clearTimer();
        pausedRemainingRef.current = remainingSeconds;
        setStatus('paused');
    }, [status, clearTimer, remainingSeconds]);

    const resumeTimer = useCallback(() => {
        if (status !== 'paused') return;
        setStatus('running');
        startedAtRef.current = Date.now();
        lastBeepSecondRef.current = -1;

        intervalRef.current = startInterval();
    }, [status, startInterval]);

    const resetTimer = useCallback(() => {
        clearTimer();
        if (sessionId) {
            router.patch(route('sessions.cancel', sessionId), {}, { preserveState: true });
        }
        sessionIdRef.current = null;
        autoCompletedRef.current = false;
        setTaskId(null);
        setTaskTitle('');
        setSessionId(null);
        setTotalSeconds(0);
        setRemainingSeconds(0);
        setStatus('idle');
        setType('pomodoro');
    }, [clearTimer, sessionId]);

    const completeTimer = useCallback((options?: { skipServerComplete?: boolean }) => {
        clearTimer();
        if (sessionId && !options?.skipServerComplete && !autoCompletedRef.current) {
            router.patch(route('sessions.complete', sessionId), {}, { preserveState: true });
        }
        sessionIdRef.current = null;
        autoCompletedRef.current = false;
        setStatus('idle');
        setTaskId(null);
        setTaskTitle('');
        setSessionId(null);
        setTotalSeconds(0);
        setRemainingSeconds(0);
        setType('pomodoro');
    }, [clearTimer, sessionId]);

    const incrementPomodoro = useCallback(() => {
        setPomodoroInSet(prev => prev + 1);
    }, []);

    const resetPomodoroSet = useCallback(() => {
        setPomodoroInSet(0);
    }, []);

    useEffect(() => {
        return () => clearTimer();
    }, [clearTimer]);

    // Restore timer from active session on mount (e.g. after page reload)
    const restoredRef = useRef(false);
    useEffect(() => {
        if (restoredRef.current || status !== 'idle') return;
        restoredRef.current = true;

        if (!activeSession) return;

        // Breaks have task_id=null, pomodoros have a task
        const isBreak = activeSession.type === 'short_break' || activeSession.type === 'long_break';
        if (!isBreak && !activeSession.task) return;

        const breakTitles: Record<string, string> = {
            short_break: 'Kurze Pause',
            long_break: 'Lange Pause',
        };

        const elapsedSeconds = Math.floor(
            (Date.now() - new Date(activeSession.started_at).getTime()) / 1000,
        );
        const total = activeSession.duration_minutes * 60;

        if (elapsedSeconds < total) {
            startTimer({
                taskId: activeSession.task_id ?? 0,
                taskTitle: isBreak
                    ? breakTitles[activeSession.type] ?? 'Pause'
                    : activeSession.task!.title,
                sessionId: activeSession.id,
                durationMinutes: activeSession.duration_minutes,
                type: activeSession.type,
                initialElapsedSeconds: elapsedSeconds,
            });
        } else {
            // Session has expired while page was closed — mark as completed
            router.patch(route('sessions.complete', activeSession.id), {}, { preserveState: true });
        }
    }, []);

    return (
        <TimerContext.Provider
            value={{
                taskId,
                taskTitle,
                sessionId,
                totalSeconds,
                remainingSeconds,
                status,
                type,
                pomodoroInSet,
                pendingNextTask,
                startTimer,
                pauseTimer,
                resumeTimer,
                resetTimer,
                completeTimer,
                incrementPomodoro,
                resetPomodoroSet,
                setPendingNextTask,
            }}
        >
            {children}
        </TimerContext.Provider>
    );
}

export const useTimer = () => useContext(TimerContext);
