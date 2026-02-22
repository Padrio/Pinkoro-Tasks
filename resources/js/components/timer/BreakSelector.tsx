import { useTimer } from '@/contexts/TimerContext';
import { router } from '@inertiajs/react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Coffee, Moon, X } from 'lucide-react';
import { BREAK_PRESETS } from '@/lib/constants';

interface BreakSelectorProps {
    open: boolean;
    onClose: () => void;
}

export default function BreakSelector({ open, onClose }: BreakSelectorProps) {
    const { startTimer } = useTimer();

    const handleBreak = (minutes: number, type: 'short_break' | 'long_break') => {
        router.post(route('sessions.start'), {
            task_id: 0, // Will be handled
            type,
            duration_minutes: minutes,
        }, {
            preserveState: true,
            onSuccess: (page: any) => {
                // We don't have an actual task for breaks, so we use a generic approach
                onClose();
            },
            onError: () => {
                // Fallback: start locally only
                onClose();
            },
        });
        onClose();
    };

    return (
        <AlertDialog open={open}>
            <AlertDialogContent className="glass border-white/50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                        <Coffee className="w-6 h-6 text-green-500" />
                        Pause machen?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                        Gönne dir eine kurze Verschnaufpause bevor du weitermachst.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-2 py-2">
                    <Button
                        onClick={() => handleBreak(5, 'short_break')}
                        variant="outline"
                        className="rounded-xl border-green-200 hover:bg-green-50 justify-start"
                    >
                        <Coffee className="w-4 h-4 mr-2 text-green-500" />
                        Kurze Pause (5 Min)
                    </Button>
                    <Button
                        onClick={() => handleBreak(15, 'long_break')}
                        variant="outline"
                        className="rounded-xl border-blue-200 hover:bg-blue-50 justify-start"
                    >
                        <Moon className="w-4 h-4 mr-2 text-blue-500" />
                        Lange Pause (15 Min)
                    </Button>
                </div>
                <AlertDialogFooter>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="rounded-xl"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Keine Pause
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
