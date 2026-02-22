import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Save } from 'lucide-react';
import type { Task } from '@/types';

interface TaskFormProps {
    open: boolean;
    onClose: () => void;
    task?: Task | null;
}

export default function TaskForm({ open, onClose, task }: TaskFormProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: task?.title || '',
        description: task?.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (task) {
            put(route('tasks.update', task.id), {
                onSuccess: () => { reset(); onClose(); },
            });
        } else {
            post(route('tasks.store'), {
                onSuccess: () => { reset(); onClose(); },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="glass border-white/50">
                <DialogHeader>
                    <DialogTitle className="text-gray-800">
                        {task ? 'Task bearbeiten' : 'Neuer Task'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        {task ? 'Ändere die Details deines Tasks.' : 'Erstelle einen neuen Task für deine Todo-Liste.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titel</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Was möchtest du erledigen?"
                            className="rounded-xl border-pink-200 focus:ring-pink-300"
                            autoFocus
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500">{errors.title}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Beschreibung (optional)</Label>
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Zusätzliche Notizen..."
                            className="rounded-xl border-pink-200 focus:ring-pink-300"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
                        >
                            {task ? (
                                <><Save className="w-4 h-4 mr-2" />Speichern</>
                            ) : (
                                <><Plus className="w-4 h-4 mr-2" />Erstellen</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
