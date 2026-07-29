import { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Trash2, Undo2, AlertCircle } from 'lucide-react';
import { getAllCategories } from '@/lib/categoryUtils';
import type { Task, Category } from '@/types';

interface TrashSectionProps {
    tasks: Task[];
    categories: Category[];
}

const priorityColors: Record<string, string> = {
    high: 'bg-red-400',
    medium: 'bg-amber-400',
    low: 'bg-blue-400',
};

function formatDeletedAt(deletedAt: string | null): string {
    if (!deletedAt) return '';

    const date = new Date(deletedAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfDeletion = new Date(date);
    dayOfDeletion.setHours(0, 0, 0, 0);

    const dayDiff = Math.round((today.getTime() - dayOfDeletion.getTime()) / 86400000);

    if (dayDiff === 0) return `heute, ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
    if (dayDiff === 1) return 'gestern';

    return date.toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
}

export default function TrashSection({ tasks, categories }: TrashSectionProps) {
    const [isOpen, setIsOpen] = useState(() => {
        const stored = localStorage.getItem('trash-collapsed');
        return stored !== null ? stored === 'true' : false;
    });
    const [confirmEmpty, setConfirmEmpty] = useState(false);
    const [taskToPurge, setTaskToPurge] = useState<Task | null>(null);

    useEffect(() => {
        localStorage.setItem('trash-collapsed', String(isOpen));
    }, [isOpen]);

    const categoryNames = useMemo(() => {
        const names = new Map<number, string>();
        for (const cat of getAllCategories(categories)) {
            names.set(cat.id, cat.name);
        }
        return names;
    }, [categories]);

    const handleRestore = (task: Task) => {
        router.post(route('tasks.restore', task.id), {}, { preserveState: true });
    };

    const handlePurge = () => {
        if (!taskToPurge) return;
        router.delete(route('tasks.force-destroy', taskToPurge.id), {
            preserveState: true,
            onFinish: () => setTaskToPurge(null),
        });
    };

    const handleEmptyTrash = () => {
        router.delete(route('tasks.trash.empty'), {
            preserveState: true,
            onFinish: () => setConfirmEmpty(false),
        });
    };

    if (tasks.length === 0) return null;

    return (
        <>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="glass p-3 opacity-75">
                    <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                            <button className="flex items-center gap-2 flex-1 min-w-0 text-left">
                                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                                <Trash2 className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold text-gray-500 truncate">
                                    Papierkorb
                                </span>
                                <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-0 text-xs">
                                    {tasks.length}
                                </Badge>
                            </button>
                        </CollapsibleTrigger>
                        {isOpen && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirmEmpty(true)}
                                className="h-7 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            >
                                Leeren
                            </Button>
                        )}
                    </div>
                </div>
                <CollapsibleContent>
                    <div className="pl-4 mt-2 space-y-2">
                        <AnimatePresence mode="popLayout">
                            {tasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className="glass glass-hover p-3 flex items-center gap-3 group opacity-70"
                                >
                                    {task.priority && (
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-600 truncate">
                                            {task.title}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">
                                            {task.category_id !== null && categoryNames.has(task.category_id)
                                                ? categoryNames.get(task.category_id)
                                                : 'Ohne Kategorie'}
                                            {' · gelöscht '}
                                            {formatDeletedAt(task.deleted_at ?? null)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRestore(task)}
                                            title="Wiederherstellen"
                                            className="text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                        >
                                            <Undo2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setTaskToPurge(task)}
                                            title="Endgültig löschen"
                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <AlertDialog open={taskToPurge !== null} onOpenChange={(open) => !open && setTaskToPurge(null)}>
                <AlertDialogContent className="glass border-white/50">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            Endgültig löschen?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                            &ldquo;{taskToPurge?.title}&rdquo; wird unwiderruflich gelöscht — samt aller
                            aufgezeichneten Pomodoro-Zeiten.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handlePurge}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                        >
                            Endgültig löschen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={confirmEmpty} onOpenChange={setConfirmEmpty}>
                <AlertDialogContent className="glass border-white/50">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            Papierkorb leeren?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                            Alle {tasks.length} Tasks im Papierkorb werden unwiderruflich gelöscht — samt
                            aller aufgezeichneten Pomodoro-Zeiten.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleEmptyTrash}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                        >
                            Papierkorb leeren
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
