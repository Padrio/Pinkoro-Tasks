import { useState, useEffect, useRef, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import type { DailyGoal } from '@/types';

interface Reminder {
    id: number;
    taskTitle: string;
    timeSlotStart: string;
}

export default function TimeSlotReminder() {
    const { props } = usePage();
    const dailyGoal = (props as any).dailyGoal as DailyGoal | null;

    const [reminders, setReminders] = useState<Reminder[]>([]);
    const notifiedIds = useRef<Set<number>>(new Set());
    const prevGoalId = useRef<number | null>(null);

    // Reset notified set when daily goal changes
    useEffect(() => {
        const goalId = dailyGoal?.id ?? null;
        if (goalId !== prevGoalId.current) {
            notifiedIds.current = new Set();
            prevGoalId.current = goalId;
        }
    }, [dailyGoal?.id]);

    const checkSlots = useCallback(() => {
        if (!dailyGoal?.tasks.length) return;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        for (const task of dailyGoal.tasks) {
            if (task.is_completed || !task.time_slot_start || notifiedIds.current.has(task.id)) {
                continue;
            }

            const [h, m] = task.time_slot_start.split(':').map(Number);
            const slotMinutes = h * 60 + m;
            const diff = slotMinutes - currentMinutes;

            if (diff > 0 && diff <= 10) {
                notifiedIds.current.add(task.id);
                setReminders(prev => [...prev, {
                    id: task.id,
                    taskTitle: task.title,
                    timeSlotStart: task.time_slot_start!,
                }]);
            }
        }
    }, [dailyGoal]);

    useEffect(() => {
        checkSlots();
        const interval = setInterval(checkSlots, 30_000);
        return () => clearInterval(interval);
    }, [checkSlots]);

    const dismiss = (id: number) => {
        setReminders(prev => prev.filter(r => r.id !== id));
    };

    // Auto-dismiss after 8s
    useEffect(() => {
        if (reminders.length === 0) return;

        const latest = reminders[reminders.length - 1];
        const timer = setTimeout(() => dismiss(latest.id), 8000);
        return () => clearTimeout(timer);
    }, [reminders.length]);

    return (
        <AnimatePresence>
            {reminders.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm space-y-2">
                    {reminders.map((reminder) => (
                        <motion.div
                            key={reminder.id}
                            initial={{ opacity: 0, y: 80, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: 'spring', bounce: 0.4 }}
                            className="glass border border-pink-200/50 p-4 rounded-xl shadow-xl"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-pink-600 uppercase tracking-wider">
                                        Bald geht's los!
                                    </p>
                                    <p className="font-bold text-gray-800 truncate">
                                        {reminder.taskTitle}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Startet um {reminder.timeSlotStart}
                                    </p>
                                </div>
                                <button
                                    onClick={() => dismiss(reminder.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}
