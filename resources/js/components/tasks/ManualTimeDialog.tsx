import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Timer } from 'lucide-react';
import type { Task } from '@/types';

interface ManualTimeDialogProps {
    open: boolean;
    onClose: () => void;
    task: Task;
}

export default function ManualTimeDialog({ open, onClose, task }: ManualTimeDialogProps) {
    const [minutes, setMinutes] = useState('');

    const submit = (manualMinutes?: number) => {
        const data: Record<string, any> = {};
        if (manualMinutes && manualMinutes > 0) {
            data.manual_minutes = manualMinutes;
        }
        router.patch(route('tasks.toggle', task.id), data, { preserveState: true });
        onClose();
    };

    return (
        <AlertDialog open={open}>
            <AlertDialogContent className="glass border-white/50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                        <Timer className="w-6 h-6 text-pink-500" />
                        Zeit erfassen
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                        Möchtest du die gebrauchte Zeit für &ldquo;{task.title}&rdquo; eintragen?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                    <Input
                        type="number"
                        min={1}
                        max={999}
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                submit(parseInt(minutes) || (task.estimated_minutes ?? 0));
                            }
                        }}
                        placeholder={task.estimated_minutes ? `${task.estimated_minutes}` : 'Minuten'}
                        className="rounded-xl border-pink-200"
                        autoFocus
                    />
                </div>
                <AlertDialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => submit()}
                        className="rounded-xl border-pink-200"
                    >
                        Ohne Zeiterfassung
                    </Button>
                    <Button
                        onClick={() => submit(parseInt(minutes) || (task.estimated_minutes ?? 0))}
                        className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
                    >
                        Speichern
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
