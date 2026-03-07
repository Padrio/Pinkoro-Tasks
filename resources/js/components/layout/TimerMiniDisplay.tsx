import { useTimer } from '@/contexts/TimerContext';
import { usePage } from '@inertiajs/react';
import { formatTime } from '@/lib/formatTime';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { TimerDisplayMode } from '@/types';

const MODES_WITHOUT_TIME: TimerDisplayMode[] = ['ring_only', 'ring_percent', 'liquid_only'];

export default function TimerMiniDisplay() {
    const { status, remainingSeconds, taskTitle, type, setExpanded } = useTimer();
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

    // On pages with a timer widget, hide mini timer when display mode doesn't show time
    const hasTimerWidget = url === '/' || url.startsWith('/tasks');
    if (hasTimerWidget && MODES_WITHOUT_TIME.includes(displayMode)) return null;

    const typeColors: Record<string, string> = {
        pomodoro: 'bg-pink-100 text-pink-700 border-pink-200',
        short_break: 'bg-green-100 text-green-700 border-green-200',
        long_break: 'bg-blue-100 text-blue-700 border-blue-200',
        custom: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    return (
        <AnimatePresence>
            <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => {
                    console.log('[Pinkoro:MiniTimer] clicked → expanding');
                    setExpanded(true);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium cursor-pointer hover:brightness-95 transition-all ${typeColors[type] || typeColors.pomodoro}`}
                title="Timer vergrößern"
            >
                <Timer className="w-4 h-4" />
                <span className="font-mono-timer tabular-nums">
                    {formatTime(remainingSeconds)}
                </span>
                {status === 'paused' && (
                    <span className="text-xs opacity-60">pausiert</span>
                )}
            </motion.button>
        </AnimatePresence>
    );
}
