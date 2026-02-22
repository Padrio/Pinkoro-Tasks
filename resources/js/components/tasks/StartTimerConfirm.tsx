import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from '@/hooks/use-toast';
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
import { Play, Timer } from 'lucide-react';
import { TIMER_PRESETS } from '@/lib/constants';
import type { Task, Settings } from '@/types';

interface StartTimerConfirmProps {
    open: boolean;
    onClose: () => void;
    task: Task;
    settings: Settings;
}

export default function StartTimerConfirm({ open, onClose, task, settings }: StartTimerConfirmProps) {
    const { startTimer, pomodoroInSet } = useTimer();
    const [selectedMinutes, setSelectedMinutes] = useState(settings.pomodoro_duration);
    const [selectedType, setSelectedType] = useState<'pomodoro' | 'short_break' | 'long_break' | 'custom'>('pomodoro');
    const [customMinutes, setCustomMinutes] = useState('');

    const presets = [
        { label: `Pomodoro (${settings.pomodoro_duration} Min)`, value: settings.pomodoro_duration, type: 'pomodoro' as const },
        { label: `Kurze Pause (${settings.short_break_duration} Min)`, value: settings.short_break_duration, type: 'short_break' as const },
        { label: `Lange Pause (${settings.long_break_duration} Min)`, value: settings.long_break_duration, type: 'long_break' as const },
    ];

    const handleStart = () => {
        const minutes = selectedType === 'custom' ? parseInt(customMinutes) || 25 : selectedMinutes;
        const type = selectedType;

        router.post(route('sessions.start'), {
            task_id: task.id,
            type,
            duration_minutes: minutes,
        }, {
            preserveState: true,
            onSuccess: (page: any) => {
                const activeSession = (page as any).props?.activeSession;
                startTimer({
                    taskId: task.id,
                    taskTitle: task.title,
                    sessionId: activeSession?.id || 0,
                    durationMinutes: minutes,
                    type,
                });

                const flash = (page as any).props?.flash;
                const bedtime = flash?.bedtime;
                const motivation = flash?.motivation;

                if (bedtime) {
                    toast({
                        title: 'Feierabend? 🌙',
                        description: bedtime,
                    });
                } else if (motivation) {
                    toast({
                        title: motivation.type === 'praise' ? 'Früher Vogel! 🐦' : 'Aufgewacht? ⏰',
                        description: motivation.message,
                    });
                }

                onClose();
            },
        });
    };

    return (
        <AlertDialog open={open}>
            <AlertDialogContent className="glass border-white/50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                        <Timer className="w-6 h-6 text-pink-500" />
                        Timer starten
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                        Starte einen Timer für &ldquo;{task.title}&rdquo;
                        {pomodoroInSet > 0 && (
                            <span className="block text-xs text-gray-400 mt-1">
                                Pomodoro {pomodoroInSet}/{settings.pomodoros_per_set} im aktuellen Set abgeschlossen
                            </span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-3 py-2">
                    {presets.map((preset) => (
                        <Button
                            key={preset.type}
                            variant={selectedType === preset.type ? 'default' : 'outline'}
                            className={`w-full rounded-xl justify-start ${
                                selectedType === preset.type
                                    ? 'bg-pink-400 hover:bg-pink-500 text-white'
                                    : 'border-pink-200 hover:bg-pink-50'
                            }`}
                            onClick={() => {
                                setSelectedType(preset.type);
                                setSelectedMinutes(preset.value);
                            }}
                        >
                            {preset.label}
                        </Button>
                    ))}
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
                                placeholder="Minuten"
                                className="w-24 rounded-xl border-pink-200"
                                autoFocus
                            />
                        )}
                    </div>
                </div>
                <AlertDialogFooter>
                    <Button variant="outline" onClick={onClose} className="rounded-xl border-pink-200">
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleStart}
                        className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Starten
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
