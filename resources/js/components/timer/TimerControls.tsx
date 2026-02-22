import { useTimer } from '@/contexts/TimerContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function TimerControls() {
    const { status, pauseTimer, resumeTimer, resetTimer } = useTimer();

    if (status === 'idle' || status === 'completed') return null;

    return (
        <div className="flex items-center gap-3">
            {status === 'running' ? (
                <Button
                    onClick={pauseTimer}
                    size="lg"
                    className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl shadow-lg shadow-pink-200/50"
                >
                    <Pause className="w-5 h-5 mr-2" />
                    Pausieren
                </Button>
            ) : (
                <Button
                    onClick={resumeTimer}
                    size="lg"
                    className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl shadow-lg shadow-pink-200/50"
                >
                    <Play className="w-5 h-5 mr-2" />
                    Fortsetzen
                </Button>
            )}
            <Button
                onClick={resetTimer}
                variant="outline"
                size="lg"
                className="rounded-xl border-pink-200 hover:bg-pink-50"
            >
                <RotateCcw className="w-5 h-5 mr-2" />
                Abbrechen
            </Button>
        </div>
    );
}
