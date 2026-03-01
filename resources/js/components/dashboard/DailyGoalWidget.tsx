import { useState, useEffect, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Target, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCountdown, formatMinutes } from '@/lib/formatTime';
import DailyGoalTaskRow from './DailyGoalTaskRow';
import DailyGoalDialog from './DailyGoalDialog';
import type { DailyGoal, DailyGoalTask, Task, Settings } from '@/types';

interface DailyGoalWidgetProps {
    dailyGoal: DailyGoal | null;
    incompleteTasks: Task[];
}

function getTimeSlotActiveIds(tasks: DailyGoalTask[]): Set<number> {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const ids = new Set<number>();

    for (const task of tasks) {
        if (task.time_slot_start && task.time_slot_end && !task.is_completed) {
            const [sh, sm] = task.time_slot_start.split(':').map(Number);
            const [eh, em] = task.time_slot_end.split(':').map(Number);
            const start = sh * 60 + sm;
            const end = eh * 60 + em;
            if (currentMinutes >= start && currentMinutes < end) {
                ids.add(task.id);
            }
        }
    }

    return ids;
}

function timeSlotToMinutes(slot: string | null): number {
    if (!slot) return Infinity;
    const [h, m] = slot.split(':').map(Number);
    return h * 60 + m;
}

function sortTasks(tasks: DailyGoalTask[]): DailyGoalTask[] {
    // First, separate by sort_order (the drag-drop order from the planning dialog)
    const byOrder = [...tasks].sort((a, b) => a.sort_order - b.sort_order);

    // Split into time-slotted and unslotted, preserving sort_order
    const slotted = byOrder.filter(t => t.time_slot_start);
    const unslotted = byOrder.filter(t => !t.time_slot_start);

    // Sort slotted tasks by their time_slot_start
    slotted.sort((a, b) => timeSlotToMinutes(a.time_slot_start) - timeSlotToMinutes(b.time_slot_start));

    // Interleave: unslotted tasks keep their sort_order positions among slotted
    // Build combined list by placing each unslotted task at its original sort_order rank
    const result: DailyGoalTask[] = [];
    let slotIdx = 0;
    let unslotIdx = 0;

    for (let i = 0; i < byOrder.length; i++) {
        const original = byOrder[i];
        if (original.time_slot_start) {
            // This position had a slotted task — place next slotted (by time)
            if (slotIdx < slotted.length) {
                result.push(slotted[slotIdx++]);
            }
        } else {
            // This position had an unslotted task — place it here
            if (unslotIdx < unslotted.length) {
                result.push(unslotted[unslotIdx++]);
            }
        }
    }

    // Finally, move completed tasks to the bottom
    return result.sort((a, b) => {
        if (a.is_completed !== b.is_completed) {
            return a.is_completed ? 1 : -1;
        }
        return 0; // preserve interleaved order
    });
}

export default function DailyGoalWidget({ dailyGoal, incompleteTasks }: DailyGoalWidgetProps) {
    const settings = usePage<{ settings: Settings }>().props.settings;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [, setTick] = useState(0);

    // Re-render every 60s to keep countdown and active-slot highlighting fresh
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 60_000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = () => {
        if (!confirm('Tagesplan wirklich löschen?')) return;
        router.delete(route('daily-goal.destroy'), { preserveState: true });
    };

    const progressPercent = dailyGoal && dailyGoal.total_count > 0
        ? Math.round((dailyGoal.completed_count / dailyGoal.total_count) * 100)
        : 0;

    const activeIds = dailyGoal ? getTimeSlotActiveIds(dailyGoal.tasks) : new Set<number>();
    const sortedTasks = useMemo(
        () => dailyGoal ? sortTasks(dailyGoal.tasks) : [],
        [dailyGoal?.tasks],
    );

    // Time budget calculation (live via tick)
    const estimatedTotal = dailyGoal?.tasks.reduce((sum, t) => sum + (t.estimated_minutes ?? 0), 0) ?? 0;
    let availableMinutes: number | null = null;
    if (dailyGoal?.end_time) {
        const now = new Date();
        const [h, m] = dailyGoal.end_time.split(':').map(Number);
        const end = new Date();
        end.setHours(h, m, 0, 0);
        const diff = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 60000));
        availableMinutes = diff;
    }

    if (!dailyGoal) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 text-center"
            >
                <div className="flex items-center justify-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-pink-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Tagesplanung</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    Plane deinen Tag! Wähle Tasks und setze dein Arbeitsende fest.
                </p>
                <Button
                    onClick={() => setDialogOpen(true)}
                    className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
                >
                    Tag planen
                </Button>

                <DailyGoalDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    dailyGoal={null}
                    incompleteTasks={incompleteTasks}
                />
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-pink-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Tagesplanung</h3>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDialogOpen(true)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDelete}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {dailyGoal.end_time && (
                <p className="text-sm text-gray-600 mb-2">
                    Feierabend: {dailyGoal.end_time} · noch {formatCountdown(dailyGoal.end_time)}
                </p>
            )}

            {dailyGoal.total_count > 0 && (
                <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{dailyGoal.completed_count}/{dailyGoal.total_count} Tasks</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                </div>
            )}

            {sortedTasks.length > 0 && (
                <div className="space-y-1">
                    {sortedTasks.map((task, idx) => (
                        <DailyGoalTaskRow
                            key={task.id}
                            task={task}
                            index={idx + 1}
                            isTimeSlotActive={activeIds.has(task.id)}
                            settings={settings}
                        />
                    ))}
                </div>
            )}

            {estimatedTotal > 0 && (
                <p className="text-xs text-gray-400 mt-3">
                    ~{formatMinutes(estimatedTotal)} geplant
                    {availableMinutes !== null && ` von ${formatMinutes(availableMinutes)} verfügbar`}
                </p>
            )}

            <DailyGoalDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                dailyGoal={dailyGoal}
                incompleteTasks={incompleteTasks}
            />
        </motion.div>
    );
}
