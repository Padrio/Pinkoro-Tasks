import { useTimer } from '@/contexts/TimerContext';
import { usePage } from '@inertiajs/react';
import { formatTime } from '@/lib/formatTime';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { TimerDisplayMode } from '@/types';

const MODES_WITHOUT_TIME: TimerDisplayMode[] = ['ring_only', 'ring_percent', 'liquid_only'];

export default function TimerMiniDisplay() {
    const { status, remainingSeconds, taskTitle, type } = useTimer();
    const { url } = usePage();

    const [displayMode, setDisplayMode] = useState<TimerDisplayMode>('ring_time');

    useEffect(() => {
        const mode = localStorage.getItem('timer_display_mode') as TimerDisplayMode | null;
        if (mode) setDisplayMode(mode);

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'timer_display_mode' && e.newValue) {
                setDisplayMode(e.newValue as TimerDisplayMode);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Also poll localStorage for same-tab changes (storage event only fires cross-tab)
    useEffect(() => {
        const interval = setInterval(() => {
            const mode = localStorage.getItem('timer_display_mode') as TimerDisplayMode | null;
            if (mode && mode !== displayMode) setDisplayMode(mode);
        }, 500);
        return () => clearInterval(interval);
    }, [displayMode]);

    if (status === 'idle') return null;

    // On Tasks page, hide mini timer when display mode doesn't show time
    const isTasksPage = url.startsWith('/tasks');
    if (isTasksPage && MODES_WITHOUT_TIME.includes(displayMode)) return null;

    const typeColors: Record<string, string> = {
        pomodoro: 'bg-pink-100 text-pink-700 border-pink-200',
        short_break: 'bg-green-100 text-green-700 border-green-200',
        long_break: 'bg-blue-100 text-blue-700 border-blue-200',
        custom: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium ${typeColors[type] || typeColors.pomodoro}`}
            >
                <Timer className="w-4 h-4" />
                <span className="font-mono-timer tabular-nums">
                    {formatTime(remainingSeconds)}
                </span>
                {status === 'paused' && (
                    <span className="text-xs opacity-60">pausiert</span>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
