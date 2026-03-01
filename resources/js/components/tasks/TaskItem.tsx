import { forwardRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSound } from '@/contexts/SoundContext';
import { useTimer } from '@/contexts/TimerContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GripVertical, Play, Pencil, Trash2, Timer, Calendar } from 'lucide-react';
import { getDeadlineStatus, formatDeadline } from '@/lib/formatTime';
import type { Task, Settings } from '@/types';
import TaskForm from './TaskForm';
import StartTimerConfirm from './StartTimerConfirm';
import TimerRunningAlert from './TimerRunningAlert';
import ManualTimeDialog from './ManualTimeDialog';

const priorityColors: Record<string, string> = {
    high: 'bg-red-400',
    medium: 'bg-amber-400',
    low: 'bg-blue-400',
};

interface TaskItemProps {
    task: Task;
    settings: Settings;
    sortMode?: 'manual' | 'deadline' | 'priority';
}

const deadlineColors: Record<string, string> = {
    overdue: 'bg-red-100 text-red-700 border-0',
    today: 'bg-orange-100 text-orange-700 border-0',
    soon: 'bg-yellow-100 text-yellow-700 border-0',
    normal: 'bg-gray-100 text-gray-600 border-0',
};

const TaskItem = forwardRef<HTMLDivElement, TaskItemProps>(({ task, settings, sortMode = 'manual' }, ref) => {
    const { playSound } = useSound();
    const { status: timerStatus, taskId: timerTaskId, taskTitle: runningTaskTitle, totalSeconds, remainingSeconds, completeTimer } = useTimer();
    const [showEdit, setShowEdit] = useState(false);
    const [showTimerConfirm, setShowTimerConfirm] = useState(false);
    const [showTimerRunning, setShowTimerRunning] = useState(false);
    const [showManualTime, setShowManualTime] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const combinedRef = (node: HTMLDivElement | null) => {
        setNodeRef(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const timerRunningForThisTask = (timerStatus === 'running' || timerStatus === 'paused') && timerTaskId === task.id;

    const handleToggle = () => {
        if (!task.is_completed) {
            playSound('task-complete');

            // Timer is running for this task → stop it, transfer actual elapsed time
            if (timerRunningForThisTask) {
                const elapsedMinutes = Math.max(1, Math.round((totalSeconds - remainingSeconds) / 60));
                completeTimer({ skipServerComplete: true });
                router.patch(route('tasks.toggle', task.id), { elapsed_minutes: elapsedMinutes }, { preserveState: true });
                return;
            }

            // No timer, no logged time, but has estimate → ask for manual time
            if (actualMinutes === 0 && hasEstimate) {
                setShowManualTime(true);
                return;
            }
        }

        router.patch(route('tasks.toggle', task.id), {}, { preserveState: true });
    };

    const handleDelete = () => {
        router.delete(route('tasks.destroy', task.id), { preserveState: true });
    };

    const handleStartTimer = () => {
        if (timerStatus === 'running' || timerStatus === 'paused') {
            setShowTimerRunning(true);
            return;
        }
        setShowTimerConfirm(true);
    };

    const pomodoroCount = task.pomodoro_count ?? 0;
    const actualMinutes = task.actual_minutes ?? 0;
    const hasEstimate = task.estimated_minutes !== null && task.estimated_minutes > 0;
    const progressPercent = hasEstimate
        ? Math.min(100, Math.round((actualMinutes / task.estimated_minutes!) * 100))
        : 0;
    const estimateReached = hasEstimate && actualMinutes >= task.estimated_minutes!;
    const overEstimate = hasEstimate && actualMinutes > task.estimated_minutes! * 1.2;
    const fasterThanEstimate = task.is_completed && hasEstimate && actualMinutes < task.estimated_minutes!;

    const timeBadgeColor = overEstimate
        ? 'bg-orange-100 text-orange-700'
        : estimateReached
            ? 'bg-green-100 text-green-700'
            : fasterThanEstimate
                ? 'bg-teal-100 text-teal-700'
                : 'bg-pink-100 text-pink-700';

    return (
        <>
            <motion.div
                ref={combinedRef}
                style={style}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`glass glass-hover p-4 flex flex-col gap-2 group ${
                    isDragging ? 'opacity-50 z-50' : ''
                } ${task.is_completed ? 'opacity-60' : ''}`}
            >
                <div className="flex items-center gap-3">
                    {sortMode === 'manual' && (
                        <button
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
                        >
                            <GripVertical className="w-5 h-5" />
                        </button>
                    )}

                    <Checkbox
                        checked={task.is_completed}
                        onCheckedChange={handleToggle}
                        className="border-pink-300 data-[state=checked]:bg-pink-400 data-[state=checked]:border-pink-400"
                    />

                    {task.priority && (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
                    )}

                    <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setIsExpanded(prev => !prev)}
                    >
                        <p className={`font-medium text-gray-800 ${
                            isExpanded ? 'break-words' : 'truncate'
                        } ${task.is_completed ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                        </p>
                        {task.description && (
                            <p className={`text-sm text-gray-500 ${isExpanded ? 'break-words whitespace-pre-line' : 'truncate'}`}>{task.description}</p>
                        )}
                    </div>

                    {task.deadline && !task.is_completed && (
                        <Badge variant="secondary" className={deadlineColors[getDeadlineStatus(task.deadline)]}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDeadline(task.deadline)}
                        </Badge>
                    )}

                    {(actualMinutes > 0 || hasEstimate) && (
                        <Badge variant="secondary" className={`border-0 ${timeBadgeColor}`}>
                            <Timer className="w-3 h-3 mr-1" />
                            {hasEstimate ? `${actualMinutes}/${task.estimated_minutes} Min` : `${actualMinutes} Min`}
                        </Badge>
                    )}

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!task.is_completed && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleStartTimer}
                                className="text-pink-500 hover:text-pink-700 hover:bg-pink-50 rounded-lg"
                            >
                                <Play className="w-4 h-4" />
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowEdit(true)}
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
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {hasEstimate && !task.is_completed && (
                    <div className="pl-[52px] pr-2">
                        <Progress
                            value={progressPercent}
                            className="h-1.5"
                        />
                    </div>
                )}
            </motion.div>

            <TaskForm open={showEdit} onClose={() => setShowEdit(false)} task={task} />
            <StartTimerConfirm
                open={showTimerConfirm}
                onClose={() => setShowTimerConfirm(false)}
                task={task}
                settings={settings}
            />
            <TimerRunningAlert
                open={showTimerRunning}
                onClose={() => setShowTimerRunning(false)}
                runningTaskTitle={runningTaskTitle}
            />
            <ManualTimeDialog
                open={showManualTime}
                onClose={() => setShowManualTime(false)}
                task={task}
            />
        </>
    );
});
TaskItem.displayName = 'TaskItem';
export default TaskItem;
