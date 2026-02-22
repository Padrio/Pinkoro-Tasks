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
import { CheckCircle, Clock, Coffee, Moon, Play } from 'lucide-react';
import type { Settings } from '@/types';

interface TimerCompleteDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function TimerCompleteDialog({ open, onClose }: TimerCompleteDialogProps) {
    const { taskId, taskTitle, sessionId, type, completeTimer, pomodoroInSet, incrementPomodoro, resetPomodoroSet, startTimer } = useTimer();
    const { props } = usePage();
    const settings = (props as any).settings as Settings | undefined;

    const pomodorosPerSet = settings?.pomodoros_per_set ?? 4;
    const shortBreakMin = settings?.short_break_duration ?? 5;
    const longBreakMin = settings?.long_break_duration ?? 15;

    // After this pomodoro, will it be the last in the set?
    const nextPomodoroNumber = pomodoroInSet + 1;
    const isSetComplete = nextPomodoroNumber >= pomodorosPerSet;
    const suggestedBreakType = isSetComplete ? 'long_break' : 'short_break';
    const suggestedBreakMin = isSetComplete ? longBreakMin : shortBreakMin;

    const handleTaskComplete = () => {
        incrementPomodoro();
        completeTimer({ skipServerComplete: true });

        // 1. Complete session first (records minutes in DB)
        // 2. Then toggle task (so withSum picks up the completed session's minutes)
        const completeSession = (then: () => void) => {
            if (sessionId) {
                router.patch(route('sessions.complete', sessionId), {}, {
                    preserveState: true,
                    onSuccess: () => then(),
                    onError: () => then(),
                });
            } else {
                then();
            }
        };

        completeSession(() => {
            if (taskId) {
                router.patch(route('tasks.toggle', taskId), {}, { preserveState: true });
            }
        });
    };

    const handleTaskNotDone = () => {
        incrementPomodoro();
        completeTimer({ skipServerComplete: true });

        if (sessionId) {
            router.patch(route('sessions.complete', sessionId), {}, { preserveState: true });
        }
    };

    const startBreak = (minutes: number, breakType: 'short_break' | 'long_break') => {
        if (isSetComplete) {
            resetPomodoroSet();
        }
        // Start break timer locally (breaks don't need server session)
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

    const handleBreakDone = () => {
        completeTimer();
        onClose();
    };

    // POMODORO COMPLETED
    if (type === 'pomodoro' || type === 'custom') {
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
                                <>Pomodoro {nextPomodoroNumber}/{pomodorosPerSet} für &ldquo;{taskTitle}&rdquo; ist fertig. </>
                            )}
                            {isSetComplete
                                ? 'Du hast ein ganzes Set geschafft! Zeit für eine lange Pause.'
                                : 'Ist der Task erledigt?'
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Task complete buttons */}
                    <div className="flex items-center gap-2 py-1">
                        <Button
                            onClick={handleTaskNotDone}
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-pink-200 flex-1"
                        >
                            <Clock className="w-4 h-4 mr-1.5" />
                            Noch nicht fertig
                        </Button>
                        <Button
                            onClick={handleTaskComplete}
                            size="sm"
                            className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl flex-1"
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
                            onClick={onClose}
                            variant="ghost"
                            className="rounded-xl text-gray-500"
                        >
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
                        {type === 'long_break'
                            ? 'Deine lange Pause ist vorbei. Bereit für ein neues Pomodoro-Set?'
                            : 'Deine kurze Pause ist vorbei. Bereit für den nächsten Pomodoro?'
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button
                        onClick={handleBreakDone}
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
