import { router } from '@inertiajs/react';
import { useTimer } from '@/contexts/TimerContext';
import { useSound } from '@/contexts/SoundContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function TimerControls() {
    const { status, taskId, type, totalSeconds, remainingSeconds, pauseTimer, resumeTimer, resetTimer, completeTimer } = useTimer();
    const { playSound } = useSound();

    if (status === 'idle' || status === 'completed') return null;

    const isBreak = type === 'short_break' || type === 'long_break';

    const handleComplete = () => {
        if (!taskId) return;
        const elapsedMinutes = Math.max(1, Math.round((totalSeconds - remainingSeconds) / 60));
        playSound('task-complete');
        completeTimer({ skipServerComplete: true });
        router.patch(route('tasks.toggle', taskId), { elapsed_minutes: elapsedMinutes }, { preserveState: true });
    };

    const handleSkipBreak = () => {
        completeTimer();
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-3">
            {status === 'running' ? (
                <Button
                    onClick={pauseTimer}
                    size="default"
                    className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl shadow-lg shadow-pink-200/50"
                >
                    <Pause className="w-4 h-4 mr-2" />
                    Pausieren
                </Button>
            ) : (
                <Button
                    onClick={resumeTimer}
                    size="default"
                    className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl shadow-lg shadow-pink-200/50"
                >
                    <Play className="w-4 h-4 mr-2" />
                    Fortsetzen
                </Button>
            )}
            {isBreak ? (
                <Button
                    onClick={handleSkipBreak}
                    variant="outline"
                    size="default"
                    className="rounded-xl border-pink-200 hover:bg-pink-50"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Pause beenden
                </Button>
            ) : (
                <>
                    <Button
                        onClick={handleComplete}
                        size="default"
                        className="bg-green-400 hover:bg-green-500 text-white rounded-xl shadow-lg shadow-green-200/50"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Erledigt
                    </Button>
                    <Button
                        onClick={resetTimer}
                        variant="outline"
                        size="default"
                        className="rounded-xl border-pink-200 hover:bg-pink-50"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Abbrechen
                    </Button>
                </>
            )}
        </div>
    );
}
