import React, { createContext, useContext, useCallback, useRef, useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useSound } from './SoundContext';
import type { PomodoroSession, TimerStatus } from '@/types';

interface TimerContextType {
    taskId: number | null;
    taskTitle: string;
    sessionId: number | null;
    totalSeconds: number;
    remainingSeconds: number;
    status: TimerStatus;
    type: 'pomodoro' | 'short_break' | 'long_break' | 'custom';
    pomodoroInSet: number;
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
    startTimer: () => {},
    pauseTimer: () => {},
    resumeTimer: () => {},
    resetTimer: () => {},
    completeTimer: () => {},
    incrementPomodoro: () => {},
    resetPomodoroSet: () => {},
});

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const { playSound } = useSound();
    const [taskId, setTaskId] = useState<number | null>(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [status, setStatus] = useState<TimerStatus>('idle');
    const [type, setType] = useState<'pomodoro' | 'short_break' | 'long_break' | 'custom'>('pomodoro');
    const [pomodoroInSet, setPomodoroInSet] = useState(0);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startedAtRef = useRef<number>(0);
    const pausedRemainingRef = useRef<number>(0);
    const typeRef = useRef<'pomodoro' | 'short_break' | 'long_break' | 'custom'>('pomodoro');

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

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
            setStatus('running');

            startedAtRef.current = Date.now();
            pausedRemainingRef.current = initialRemaining;

            intervalRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
                const rem = Math.max(0, pausedRemainingRef.current - elapsed);
                setRemainingSeconds(rem);

                if (rem <= 0) {
                    clearTimer();
                    setStatus('completed');
                    playSound(
                        typeRef.current === 'pomodoro' || typeRef.current === 'custom'
                            ? 'pomodoro-end'
                            : 'break-end',
                    );
                }
            }, 250);
        },
        [clearTimer, playSound],
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

        intervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
            const rem = Math.max(0, pausedRemainingRef.current - elapsed);
            setRemainingSeconds(rem);

            if (rem <= 0) {
                clearTimer();
                setStatus('completed');
                playSound(
                    typeRef.current === 'pomodoro' || typeRef.current === 'custom'
                        ? 'pomodoro-end'
                        : 'break-end',
                );
            }
        }, 250);
    }, [status, clearTimer, playSound]);

    const resetTimer = useCallback(() => {
        clearTimer();
        if (sessionId) {
            router.patch(route('sessions.cancel', sessionId), {}, { preserveState: true });
        }
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
        if (sessionId && !options?.skipServerComplete) {
            router.patch(route('sessions.complete', sessionId), {}, { preserveState: true });
        }
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

        const activeSession = (usePage().props as any).activeSession as PomodoroSession | null;
        if (!activeSession || !activeSession.task) return;

        const elapsedSeconds = Math.floor(
            (Date.now() - new Date(activeSession.started_at).getTime()) / 1000,
        );
        const totalSeconds = activeSession.duration_minutes * 60;

        if (elapsedSeconds < totalSeconds) {
            startTimer({
                taskId: activeSession.task_id,
                taskTitle: activeSession.task.title,
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
                startTimer,
                pauseTimer,
                resumeTimer,
                resetTimer,
                completeTimer,
                incrementPomodoro,
                resetPomodoroSet,
            }}
        >
            {children}
        </TimerContext.Provider>
    );
}

export const useTimer = () => useContext(TimerContext);
