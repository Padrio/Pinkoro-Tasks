import { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useTimer } from '@/contexts/TimerContext';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Clock, Coffee, Moon, Play, Timer, X } from 'lucide-react';
import type { Settings, DailyGoal, Task } from '@/types';

interface TimerCompleteDialogProps {
    open: boolean;
    onClose: () => void;
}

const AUTO_CLOSE_MS = 120_000; // 2 minutes

export default function TimerCompleteDialog({ open, onClose }: TimerCompleteDialogProps) {
    const {
        taskId, taskTitle, type, completeTimer, pomodoroInSet,
        incrementPomodoro, resetPomodoroSet, startTimer, setPendingNextTask, pendingNextTask,
    } = useTimer();
    const { props } = usePage();
    const settings = (props as any).settings as Settings | undefined;
    const dailyGoal = (props as any).dailyGoal as DailyGoal | null;

    const pomodorosPerSet = settings?.pomodoros_per_set ?? 4;
    const shortBreakMin = settings?.short_break_duration ?? 5;
    const longBreakMin = settings?.long_break_duration ?? 15;
    const pomodoroMin = settings?.pomodoro_duration ?? 25;

    const nextPomodoroNumber = pomodoroInSet + 1;
    const isSetComplete = nextPomodoroNumber >= pomodorosPerSet;
    const suggestedBreakType = isSetComplete ? 'long_break' : 'short_break';
    const suggestedBreakMin = isSetComplete ? longBreakMin : shortBreakMin;

    // Look up total pomodoro count for the current task from shared/page props
    const incompleteTasks = (props as any).incompleteTasks as Task[] | undefined;
    const getTaskPomodoroCount = (id: number | null): number => {
        if (!id) return 0;
        const fromDaily = dailyGoal?.tasks?.find(t => t.id === id);
        if (fromDaily) return fromDaily.pomodoro_count;
        const fromIncomplete = incompleteTasks?.find(t => t.id === id);
        return fromIncomplete?.pomodoro_count ?? 0;
    };

    // Capture task info when dialog opens (before completeTimer clears it)
    const [taskChoice, setTaskChoice] = useState<'not_done' | 'done' | null>(null);
    const [showDurationPicker, setShowDurationPicker] = useState(false);
    const [selectedMinutes, setSelectedMinutes] = useState(pomodoroMin);
    const [selectedType, setSelectedType] = useState<'pomodoro' | 'custom'>('pomodoro');
    const [customMinutes, setCustomMinutes] = useState('');
    const savedTaskRef = useRef<{ id: number; title: string } | null>(null);
    const savedPomodoroCountRef = useRef(0);

    useEffect(() => {
        if (open && (type === 'pomodoro' || type === 'custom')) {
            savedTaskRef.current = taskId ? { id: taskId, title: taskTitle } : null;
            savedPomodoroCountRef.current = getTaskPomodoroCount(taskId);
            setTaskChoice(null);
            setShowDurationPicker(false);
            setSelectedMinutes(pomodoroMin);
            setSelectedType('pomodoro');
            setCustomMinutes('');
        }
    }, [open]);

    // Auto-timeout: close dialog after 2 minutes (treat as "nicht erledigt")
    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => {
            if (type === 'pomodoro' || type === 'custom') {
                if (savedTaskRef.current) {
                    setPendingNextTask(savedTaskRef.current);
                }
                incrementPomodoro();
                completeTimer({ skipServerComplete: true });
            } else {
                handleBreakDoneWithAutoStart();
                return;
            }
            onClose();
        }, AUTO_CLOSE_MS);
        return () => clearTimeout(timer);
    }, [open]);

    const findNextDailyTask = (): { id: number; title: string } | null => {
        if (!dailyGoal?.tasks) return null;
        const incompleteTasks = dailyGoal.tasks
            .filter(t => !t.is_completed)
            .sort((a, b) => a.sort_order - b.sort_order);

        const currentId = savedTaskRef.current?.id ?? taskId;
        const next = incompleteTasks.find(t => t.id !== currentId);
        return next ? { id: next.id, title: next.title } : null;
    };

    const handleTaskComplete = () => {
        incrementPomodoro();
        completeTimer({ skipServerComplete: true });
        setTaskChoice('done');

        if (savedTaskRef.current) {
            router.patch(route('tasks.toggle', savedTaskRef.current.id), {}, { preserveState: true });
        }
        const nextTask = findNextDailyTask();
        setPendingNextTask(nextTask);
    };

    const handleTaskNotDone = () => {
        incrementPomodoro();
        completeTimer({ skipServerComplete: true });
        setTaskChoice('not_done');

        if (savedTaskRef.current) {
            setPendingNextTask(savedTaskRef.current);
        }
    };

    const handleKeinePause = () => {
        // If no task choice yet, treat as "nicht fertig" first
        if (taskChoice === null) {
            handleTaskNotDone();
        }
        setShowDurationPicker(true);
    };

    const startNextPomodoro = () => {
        const taskToStart = pendingNextTask;
        if (!taskToStart) {
            onClose();
            return;
        }

        const minutes = selectedType === 'custom' ? (parseInt(customMinutes) || pomodoroMin) : selectedMinutes;
        const timerType = selectedType === 'custom' ? 'custom' as const : 'pomodoro' as const;

        router.post(route('sessions.start'), {
            task_id: taskToStart.id,
            type: timerType,
            duration_minutes: minutes,
        }, {
            preserveState: true,
            onSuccess: (page: any) => {
                const activeSession = (page as any).props?.activeSession;
                startTimer({
                    taskId: taskToStart.id,
                    taskTitle: taskToStart.title,
                    sessionId: activeSession?.id || 0,
                    durationMinutes: minutes,
                    type: timerType,
                });
                setPendingNextTask(null);
                onClose();
            },
            onError: () => {
                setPendingNextTask(null);
                onClose();
            },
        });
    };

    const startBreak = (minutes: number, breakType: 'short_break' | 'long_break') => {
        // If no task choice yet, treat as "nicht fertig" first
        if (taskChoice === null) {
            incrementPomodoro();
            completeTimer({ skipServerComplete: true });
            if (savedTaskRef.current) {
                setPendingNextTask(savedTaskRef.current);
            }
        }

        if (isSetComplete) {
            resetPomodoroSet();
        }
        router.post(route('sessions.start'), {
            task_id: null,
            type: breakType,
            duration_minutes: minutes,
        }, {
            preserveState: true,
            onSuccess: (page: any) => {
                const activeSession = (page as any).props?.activeSession;
                startTimer({
                    taskId: 0,
                    taskTitle: breakType === 'short_break' ? 'Kurze Pause' : 'Lange Pause',
                    sessionId: activeSession?.id || 0,
                    durationMinutes: minutes,
                    type: breakType,
                });
                onClose();
            },
            onError: () => {
                onClose();
            },
        });
    };

    const handleBreakDoneWithAutoStart = () => {
        completeTimer({ skipServerComplete: true });
        if (pendingNextTask) {
            router.post(route('sessions.start'), {
                task_id: pendingNextTask.id,
                type: 'pomodoro',
                duration_minutes: pomodoroMin,
            }, {
                preserveState: true,
                onSuccess: (page: any) => {
                    const activeSession = (page as any).props?.activeSession;
                    startTimer({
                        taskId: pendingNextTask.id,
                        taskTitle: pendingNextTask.title,
                        sessionId: activeSession?.id || 0,
                        durationMinutes: pomodoroMin,
                        type: 'pomodoro',
                    });
                    setPendingNextTask(null);
                    onClose();
                },
                onError: () => {
                    setPendingNextTask(null);
                    onClose();
                },
            });
        } else {
            onClose();
        }
    };

    // POMODORO COMPLETED
    if (type === 'pomodoro' || type === 'custom') {
        // Duration picker sub-view
        if (showDurationPicker) {
            const taskName = pendingNextTask?.title ?? savedTaskRef.current?.title ?? '';
            return (
                <AlertDialog open={open}>
                    <AlertDialogContent className="glass border-white/50">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                                <Timer className="w-6 h-6 text-pink-500" />
                                Nächster Pomodoro
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                                {taskName && <>Timer für &ldquo;{taskName}&rdquo; starten</>}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2 py-2">
                            <Button
                                variant={selectedType === 'pomodoro' ? 'default' : 'outline'}
                                className={`w-full rounded-xl justify-start ${
                                    selectedType === 'pomodoro'
                                        ? 'bg-pink-400 hover:bg-pink-500 text-white'
                                        : 'border-pink-200 hover:bg-pink-50'
                                }`}
                                onClick={() => {
                                    setSelectedType('pomodoro');
                                    setSelectedMinutes(pomodoroMin);
                                }}
                            >
                                Pomodoro ({pomodoroMin} Min)
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={selectedType === 'custom' ? 'default' : 'outline'}
                                    className={`rounded-xl ${
                                        selectedType === 'custom'
                                            ? 'bg-pink-400 hover:bg-pink-500 text-white'
                                            : 'border-pink-200 hover:bg-pink-50'
                                    }`}
                                    onClick={() => setSelectedType('custom')}
                                >
                                    Custom
                                </Button>
                                {selectedType === 'custom' && (
                                    <Input
                                        type="number"
                                        min={1}
                                        max={120}
                                        value={customMinutes}
                                        onChange={(e) => setCustomMinutes(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                startNextPomodoro();
                                            }
                                        }}
                                        placeholder="Minuten"
                                        className="w-24 rounded-xl border-pink-200"
                                        autoFocus
                                    />
                                )}
                            </div>
                        </div>
                        <AlertDialogFooter className="gap-2 sm:justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setPendingNextTask(null);
                                    onClose();
                                }}
                                className="rounded-xl text-gray-400 hover:text-gray-600"
                                size="sm"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Überspringen
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDurationPicker(false)}
                                    className="rounded-xl border-pink-200"
                                >
                                    Zurück
                                </Button>
                                <Button
                                    onClick={startNextPomodoro}
                                    className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Starten
                                </Button>
                            </div>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            );
        }

        return (
            <AlertDialog open={open}>
                <AlertDialogContent className="glass border-white/50">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                            <CheckCircle className="w-6 h-6 text-pink-500" />
                            Pomodoro abgeschlossen!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                            {taskTitle && (
                                <>
                                    &ldquo;{taskTitle}&rdquo; — Session #{savedPomodoroCountRef.current + 1}
                                    {' '}(Set: {nextPomodoroNumber}/{pomodorosPerSet}).{' '}
                                </>
                            )}
                            {isSetComplete
                                ? 'Du hast ein ganzes Set geschafft! Zeit für eine lange Pause.'
                                : 'Ist der Task erledigt?'
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Task complete buttons — always visible so user can change choice */}
                    <div className="flex items-center gap-2 py-1">
                        <Button
                            onClick={handleTaskNotDone}
                            variant={taskChoice === 'not_done' ? 'default' : 'outline'}
                            size="sm"
                            className={`rounded-xl flex-1 ${
                                taskChoice === 'not_done'
                                    ? 'bg-gray-500 hover:bg-gray-600 text-white'
                                    : 'border-pink-200'
                            }`}
                        >
                            <Clock className="w-4 h-4 mr-1.5" />
                            Noch nicht fertig
                        </Button>
                        <Button
                            onClick={handleTaskComplete}
                            variant={taskChoice === 'done' ? 'default' : 'outline'}
                            size="sm"
                            className={`rounded-xl flex-1 ${
                                taskChoice === 'done'
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-pink-400 hover:bg-pink-500 text-white'
                            }`}
                        >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Task erledigt!
                        </Button>
                    </div>

                    {/* Break suggestions */}
                    <div className="border-t border-white/30 pt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pause starten</p>
                        <Button
                            onClick={() => startBreak(suggestedBreakMin, suggestedBreakType)}
                            variant="outline"
                            className={`w-full rounded-xl justify-start ${
                                isSetComplete
                                    ? 'border-blue-200 hover:bg-blue-50 bg-blue-50/50'
                                    : 'border-green-200 hover:bg-green-50 bg-green-50/50'
                            }`}
                        >
                            {isSetComplete ? (
                                <><Moon className="w-4 h-4 mr-2 text-blue-500" />Lange Pause ({longBreakMin} Min) — empfohlen</>
                            ) : (
                                <><Coffee className="w-4 h-4 mr-2 text-green-500" />Kurze Pause ({shortBreakMin} Min) — empfohlen</>
                            )}
                        </Button>
                        {!isSetComplete && (
                            <Button
                                onClick={() => startBreak(longBreakMin, 'long_break')}
                                variant="outline"
                                className="w-full rounded-xl justify-start border-blue-200 hover:bg-blue-50"
                            >
                                <Moon className="w-4 h-4 mr-2 text-blue-500" />
                                Lange Pause ({longBreakMin} Min)
                            </Button>
                        )}
                        {isSetComplete && (
                            <Button
                                onClick={() => startBreak(shortBreakMin, 'short_break')}
                                variant="outline"
                                className="w-full rounded-xl justify-start border-green-200 hover:bg-green-50"
                            >
                                <Coffee className="w-4 h-4 mr-2 text-green-500" />
                                Kurze Pause ({shortBreakMin} Min)
                            </Button>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <Button
                            onClick={handleKeinePause}
                            variant="ghost"
                            className="rounded-xl text-gray-500"
                        >
                            <Play className="w-4 h-4 mr-1.5" />
                            Keine Pause
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    // BREAK COMPLETED
    return (
        <AlertDialog open={open}>
            <AlertDialogContent className="glass border-white/50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                        <Coffee className="w-6 h-6 text-green-500" />
                        Pause vorbei!
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                        {pendingNextTask
                            ? `Deine Pause ist vorbei. Nächster Task: "${pendingNextTask.title}"`
                            : type === 'long_break'
                                ? 'Deine lange Pause ist vorbei. Bereit für ein neues Pomodoro-Set?'
                                : 'Deine kurze Pause ist vorbei. Bereit für den nächsten Pomodoro?'
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button
                        onClick={handleBreakDoneWithAutoStart}
                        className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Weiter
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
