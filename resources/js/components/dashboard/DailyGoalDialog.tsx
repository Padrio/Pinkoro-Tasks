import { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates,
    arrayMove,
} from '@dnd-kit/sortable';
import { Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatMinutes, formatDeadline } from '@/lib/formatTime';
import DailyGoalTaskEntry from './DailyGoalTaskEntry';
import type { Category, DailyGoal, Task } from '@/types';

interface TaskEntryData {
    task_id: number;
    title: string;
    time_slot_start: string;
    time_slot_end: string;
    is_new?: boolean;
    category_id?: number | null;
}

interface DailyGoalDialogProps {
    open: boolean;
    onClose: () => void;
    dailyGoal: DailyGoal | null;
    incompleteTasks: Task[];
    categories?: Category[];
}

const priorityColors: Record<string, string> = {
    high: 'bg-red-400',
    medium: 'bg-amber-400',
    low: 'bg-blue-400',
};

function flattenCategories(categories: Category[]): { id: number; name: string }[] {
    const result: { id: number; name: string }[] = [];
    for (const cat of categories) {
        result.push({ id: cat.id, name: cat.name });
        if (cat.children) {
            for (const child of cat.children) {
                result.push({ id: child.id, name: `${cat.name} / ${child.name}` });
            }
        }
    }
    return result;
}

export default function DailyGoalDialog({ open, onClose, dailyGoal, incompleteTasks, categories = [] }: DailyGoalDialogProps) {
    const [endTime, setEndTime] = useState('');
    const [selectedTasks, setSelectedTasks] = useState<TaskEntryData[]>([]);
    const [processing, setProcessing] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState<number | null>(null);
    const nextTempId = useMemo(() => {
        let id = -1;
        return () => id--;
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setEndTime(dailyGoal?.end_time ?? '');
            setSelectedTasks(
                dailyGoal?.tasks.map(t => ({
                    task_id: t.id,
                    title: t.title,
                    time_slot_start: t.time_slot_start ?? '',
                    time_slot_end: t.time_slot_end ?? '',
                })) ?? []
            );
            setNewTaskTitle('');
            setNewTaskCategory(null);
        }
    }, [open, dailyGoal]);

    const selectedIds = useMemo(() => new Set(selectedTasks.map(t => t.task_id)), [selectedTasks]);

    const availableTasks = useMemo(
        () => incompleteTasks.filter(t => !selectedIds.has(t.id)),
        [incompleteTasks, selectedIds],
    );

    const estimatedTotal = useMemo(() => {
        return selectedTasks.reduce((sum, entry) => {
            if (entry.is_new) return sum;
            const task = incompleteTasks.find(t => t.id === entry.task_id);
            return sum + (task?.estimated_minutes ?? 0);
        }, 0);
    }, [selectedTasks, incompleteTasks]);

    const handleAddTask = (task: Task) => {
        setSelectedTasks(prev => [
            ...prev,
            { task_id: task.id, title: task.title, time_slot_start: '', time_slot_end: '' },
        ]);
    };

    const handleAddNewTask = () => {
        const title = newTaskTitle.trim();
        if (!title) return;

        setSelectedTasks(prev => [
            ...prev,
            {
                task_id: nextTempId(),
                title,
                time_slot_start: '',
                time_slot_end: '',
                is_new: true,
                category_id: newTaskCategory,
            },
        ]);
        setNewTaskTitle('');
        setNewTaskCategory(null);
    };

    const handleRemoveTask = (taskId: number) => {
        setSelectedTasks(prev => prev.filter(t => t.task_id !== taskId));
    };

    const handleUpdateTask = (taskId: number, field: 'time_slot_start' | 'time_slot_end', value: string) => {
        setSelectedTasks(prev =>
            prev.map(t => t.task_id === taskId ? { ...t, [field]: value } : t),
        );
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setSelectedTasks(prev => {
            const oldIndex = prev.findIndex(t => t.task_id === active.id);
            const newIndex = prev.findIndex(t => t.task_id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post(route('daily-goal.store'), {
            end_time: endTime || null,
            tasks: selectedTasks.map(t => {
                if (t.is_new) {
                    return {
                        title: t.title,
                        category_id: t.category_id ?? null,
                        time_slot_start: t.time_slot_start || null,
                        time_slot_end: t.time_slot_end || null,
                    };
                }
                return {
                    task_id: t.task_id,
                    time_slot_start: t.time_slot_start || null,
                    time_slot_end: t.time_slot_end || null,
                };
            }),
        }, {
            preserveState: true,
            onFinish: () => {
                setProcessing(false);
                onClose();
            },
        });
    };

    const flatCats = useMemo(() => flattenCategories(categories), [categories]);

    return (
        <Dialog open={open} onOpenChange={() => {}}>
            <DialogContent
                className="glass border-white/50 max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden [&>button.absolute]:hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-gray-800">Tag planen</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Plane deine Tasks für heute.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 min-w-0">
                    <div className="space-y-2">
                        <Label htmlFor="end_time">Feierabend (optional)</Label>
                        <Input
                            id="end_time"
                            type="time"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                            className="w-[140px] rounded-xl border-pink-200 focus:ring-pink-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Ausgewählte Tasks</Label>
                        {selectedTasks.length > 0 ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={selectedTasks.map(t => t.task_id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2">
                                        {selectedTasks.map(entry => (
                                            <DailyGoalTaskEntry
                                                key={entry.task_id}
                                                entry={entry}
                                                isNew={entry.is_new}
                                                onRemove={() => handleRemoveTask(entry.task_id)}
                                                onUpdate={(field, value) => handleUpdateTask(entry.task_id, field, value)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <p className="text-sm text-gray-400 py-3 text-center">
                                Noch keine Tasks ausgewählt
                            </p>
                        )}

                        {estimatedTotal > 0 && (
                            <p className="text-xs text-gray-500">
                                ~{formatMinutes(estimatedTotal)} geschätzt
                            </p>
                        )}
                    </div>

                    {/* Inline new task creation */}
                    <div className="space-y-2">
                        <Label>Neuen Task erstellen</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="Task-Name..."
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddNewTask();
                                    }
                                }}
                                className="flex-1 rounded-xl border-pink-200 focus:ring-pink-300"
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleAddNewTask}
                                disabled={!newTaskTitle.trim()}
                                className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl h-9 px-3"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {flatCats.length > 0 && (
                            <select
                                value={newTaskCategory ?? ''}
                                onChange={e => setNewTaskCategory(e.target.value ? Number(e.target.value) : null)}
                                className="w-full text-sm rounded-xl border border-pink-200 bg-white/50 px-3 py-1.5 text-gray-700 focus:ring-pink-300 focus:border-pink-300"
                            >
                                <option value="">Keine Kategorie</option>
                                {flatCats.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {availableTasks.length > 0 && (
                        <div className="space-y-2">
                            <Label>Bestehende Tasks hinzufügen</Label>
                            <div className="max-h-[200px] overflow-y-auto overflow-x-hidden space-y-1 rounded-lg border border-pink-100 p-2">
                                {availableTasks.map(task => (
                                    <button
                                        key={task.id}
                                        type="button"
                                        onClick={() => handleAddTask(task)}
                                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-pink-50 transition-colors text-left min-w-0"
                                    >
                                        <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        {task.priority && (
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
                                        )}
                                        <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{task.title}</span>
                                        {task.estimated_minutes && (
                                            <span className="text-xs text-gray-400">~{formatMinutes(task.estimated_minutes)}</span>
                                        )}
                                        {task.deadline && (
                                            <Badge variant="secondary" className="text-xs border-0 bg-gray-100 text-gray-500">
                                                {formatDeadline(task.deadline)}
                                            </Badge>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="rounded-xl border-pink-200"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Speichern
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
