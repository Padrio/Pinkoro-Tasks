import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle } from 'lucide-react';

interface TimerRunningAlertProps {
    open: boolean;
    onClose: () => void;
    runningTaskTitle: string;
}

export default function TimerRunningAlert({ open, onClose, runningTaskTitle }: TimerRunningAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="glass border-white/50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                        <AlertCircle className="w-6 h-6 text-orange-500" />
                        Timer läuft bereits
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                        Es läuft bereits ein Timer für &ldquo;{runningTaskTitle}&rdquo;.
                        Bitte beende oder stoppe diesen zuerst.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={onClose}
                        className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
                    >
                        Verstanden
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
