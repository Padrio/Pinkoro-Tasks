import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Play } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { useTimer } from '@/contexts/TimerContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StartTimerConfirm from '@/components/tasks/StartTimerConfirm';
import TimerRunningAlert from '@/components/tasks/TimerRunningAlert';
import type { DailyGoalTask, Settings, Task } from '@/types';

interface DailyGoalTaskRowProps {
    task: DailyGoalTask;
    index: number;
    isTimeSlotActive: boolean;
    settings: Settings;
}

export default function DailyGoalTaskRow({ task, index, isTimeSlotActive, settings }: DailyGoalTaskRowProps) {
    const { playSound } = useSound();
    const { status: timerStatus, taskId: timerTaskId, taskTitle: runningTaskTitle } = useTimer();
    const [showTimerConfirm, setShowTimerConfirm] = useState(false);
    const [showTimerRunning, setShowTimerRunning] = useState(false);

    const timerRunningForThis = (timerStatus === 'running' || timerStatus === 'paused') && timerTaskId === task.id;
    const showJetzt = !task.is_completed && (timerRunningForThis || isTimeSlotActive);

    const timeSlot = task.time_slot_start && task.time_slot_end
        ? `${task.time_slot_start}–${task.time_slot_end}`
        : null;

    const handleToggle = () => {
        if (!task.is_completed) {
            playSound('task-complete');
        }
        router.patch(route('tasks.toggle', task.id), {}, { preserveState: true });
    };

    const handleStartTimer = () => {
        if (timerStatus === 'running' || timerStatus === 'paused') {
            setShowTimerRunning(true);
            return;
        }
        setShowTimerConfirm(true);
    };

    // Build a minimal Task object for StartTimerConfirm
    const taskForTimer = {
        id: task.id,
        title: task.title,
    } as Task;

    return (
        <>
            <div
                className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors group ${
                    showJetzt ? 'border-l-4 border-pink-400 bg-pink-50/50 pl-2' : ''
                }`}
            >
                <span className="text-xs text-gray-400 w-[90px] flex-shrink-0 font-mono-timer">
                    {timeSlot ? `${index}. ${timeSlot}` : `${index}.`}
                </span>

                <Checkbox
                    checked={task.is_completed}
                    onCheckedChange={handleToggle}
                    className="border-pink-300 data-[state=checked]:bg-pink-400 data-[state=checked]:border-pink-400"
                />

                <span
                    className={`flex-1 text-sm truncate ${
                        task.is_completed ? 'line-through text-gray-400' : 'text-gray-700'
                    }`}
                >
                    {task.title}
                </span>

                {showJetzt && (
                    <Badge variant="secondary" className="bg-pink-100 text-pink-600 border-0 text-xs">
                        Jetzt
                    </Badge>
                )}

                {!task.is_completed && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleStartTimer}
                        className="text-pink-500 hover:text-pink-700 hover:bg-pink-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                    >
                        <Play className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>

            <StartTimerConfirm
                open={showTimerConfirm}
                onClose={() => setShowTimerConfirm(false)}
                task={taskForTimer}
                settings={settings}
            />
            <TimerRunningAlert
                open={showTimerRunning}
                onClose={() => setShowTimerRunning(false)}
                runningTaskTitle={runningTaskTitle}
            />
        </>
    );
}
