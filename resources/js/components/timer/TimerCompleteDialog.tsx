import { router } from '@inertiajs/react';
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
import { CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import BreakSelector from './BreakSelector';

interface TimerCompleteDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function TimerCompleteDialog({ open, onClose }: TimerCompleteDialogProps) {
    const { taskId, taskTitle, type, completeTimer } = useTimer();
    const [showBreak, setShowBreak] = useState(false);

    const handleTaskComplete = () => {
        if (taskId) {
            router.patch(route('tasks.toggle', taskId), {}, { preserveState: true });
        }
        completeTimer();
        setShowBreak(true);
    };

    const handleTaskNotDone = () => {
        completeTimer();
        setShowBreak(true);
    };

    const handleBreakClose = () => {
        setShowBreak(false);
        onClose();
    };

    if (showBreak && type === 'pomodoro') {
        return <BreakSelector open={true} onClose={handleBreakClose} />;
    }

    return (
        <AlertDialog open={open && !showBreak}>
            <AlertDialogContent className="glass border-white/50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                        <CheckCircle className="w-6 h-6 text-pink-500" />
                        Timer abgelaufen!
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                        {type === 'pomodoro' ? (
                            <>Der Pomodoro für &ldquo;{taskTitle}&rdquo; ist abgelaufen. Ist der Task erledigt?</>
                        ) : (
                            <>Die Pause ist vorbei. Bereit für den nächsten Pomodoro?</>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {type === 'pomodoro' ? (
                        <>
                            <Button
                                onClick={handleTaskNotDone}
                                variant="outline"
                                className="rounded-xl border-pink-200"
                            >
                                <Clock className="w-4 h-4 mr-2" />
                                Noch nicht fertig
                            </Button>
                            <Button
                                onClick={handleTaskComplete}
                                className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Task erledigt!
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => { completeTimer(); onClose(); }}
                            className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
                        >
                            Weiter
                        </Button>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
