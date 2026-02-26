import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag } from 'lucide-react';
import { formatCountdown } from '@/lib/formatTime';
import type { DailyGoal } from '@/types';

export default function DailyGoalCountdown() {
    const { props } = usePage();
    const dailyGoal = (props as any).dailyGoal as DailyGoal | null;
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        if (!dailyGoal?.end_time) return;

        const update = () => setCountdown(formatCountdown(dailyGoal.end_time!));
        update();

        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, [dailyGoal?.end_time]);

    if (!dailyGoal?.end_time) return null;

    const isOver = countdown === 'Feierabend!';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium ${
                    isOver
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}
            >
                <Flag className="w-4 h-4" />
                <span>{isOver ? 'Feierabend!' : `noch ${countdown}`}</span>
                {dailyGoal.total_count > 0 && (
                    <span className="text-xs opacity-60">
                        {dailyGoal.completed_count}/{dailyGoal.total_count}
                    </span>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
