import React, { createContext, useContext, useCallback, useRef, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { useSound } from './SoundContext';
import type { TimerStatus } from '@/types';

interface TimerContextType {
    taskId: number | null;
    taskTitle: string;
    sessionId: number | null;
    totalSeconds: number;
    remainingSeconds: number;
    status: TimerStatus;
    type: 'pomodoro' | 'short_break' | 'long_break' | 'custom';
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
    completeTimer: () => void;
}

const TimerContext = createContext<TimerContextType>({
    taskId: null,
    taskTitle: '',
    sessionId: null,
    totalSeconds: 0,
    remainingSeconds: 0,
    status: 'idle',
    type: 'pomodoro',
    startTimer: () => {},
    pauseTimer: () => {},
    resumeTimer: () => {},
    resetTimer: () => {},
    completeTimer: () => {},
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

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startedAtRef = useRef<number>(0);
    const pausedRemainingRef = useRef<number>(0);

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const tick = useCallback(() => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        const remaining = Math.max(0, pausedRemainingRef.current - elapsed);
        setRemainingSeconds(remaining);

        if (remaining <= 0) {
            clearTimer();
            setStatus('completed');
            playSound('timer-complete');
        }
    }, [clearTimer, playSound]);

    const startTimer = useCallback(
        (params: {
            taskId: number;
            taskTitle: string;
            sessionId: number;
            durationMinutes: number;
            type: 'pomodoro' | 'short_break' | 'long_break' | 'custom';
        }) => {
            clearTimer();
            const total = params.durationMinutes * 60;
            setTaskId(params.taskId);
            setTaskTitle(params.taskTitle);
            setSessionId(params.sessionId);
            setTotalSeconds(total);
            setRemainingSeconds(total);
            setType(params.type);
            setStatus('running');

            startedAtRef.current = Date.now();
            pausedRemainingRef.current = total;

            intervalRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
                const rem = Math.max(0, pausedRemainingRef.current - elapsed);
                setRemainingSeconds(rem);

                if (rem <= 0) {
                    clearTimer();
                    setStatus('completed');
                    playSound('timer-complete');
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
                playSound('timer-complete');
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

    const completeTimer = useCallback(() => {
        clearTimer();
        if (sessionId) {
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

    useEffect(() => {
        return () => clearTimer();
    }, [clearTimer]);

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
                startTimer,
                pauseTimer,
                resumeTimer,
                resetTimer,
                completeTimer,
            }}
        >
            {children}
        </TimerContext.Provider>
    );
}

export const useTimer = () => useContext(TimerContext);
