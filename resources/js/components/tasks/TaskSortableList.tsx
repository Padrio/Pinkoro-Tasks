import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent,
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import CategorySection from './CategorySection';
import ArchiveSection from './ArchiveSection';
import TaskItem from './TaskItem';
import type { Task, Category, Settings } from '@/types';

interface TaskSortableListProps {
    tasks: Task[];
    categories: Category[];
    settings: Settings;
    sortMode?: 'manual' | 'deadline';
}

export default function TaskSortableList({ tasks, categories, settings, sortMode = 'manual' }: TaskSortableListProps) {
    const [items, setItems] = useState(tasks);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    // Sync with server data (include is_completed to re-sync on toggle)
    const taskIds = tasks.map(t => `${t.id}-${t.category_id}-${t.is_completed}`).join(',');
    const itemIds = items.map(t => `${t.id}-${t.category_id}-${t.is_completed}`).join(',');
    if (taskIds !== itemIds) {
        setItems(tasks);
    }

    // Separate active and completed tasks
    const activeTasks = useMemo(() => items.filter(t => !t.is_completed), [items]);
    const completedTasks = useMemo(() => items.filter(t => t.is_completed), [items]);

    // Group active tasks by category
    const groupedTasks = useMemo(() => {
        const groups: Record<string, Task[]> = {};

        // Initialize groups for each category
        for (const cat of categories) {
            groups[String(cat.id)] = [];
        }
        groups['null'] = [];

        // Distribute only active tasks
        for (const task of activeTasks) {
            const key = task.category_id !== null ? String(task.category_id) : 'null';
            if (!groups[key]) groups[key] = [];
            groups[key].push(task);
        }

        return groups;
    }, [activeTasks, categories]);

    const findCategoryForTask = (taskId: number): string => {
        for (const [key, tasks] of Object.entries(groupedTasks)) {
            if (tasks.some(t => t.id === taskId)) return key;
        }
        return 'null';
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id;

        // Check if we're over a category droppable
        const overStr = String(overId);
        if (overStr.startsWith('category-')) {
            const targetCategoryKey = overStr.replace('category-', '');
            const sourceCategoryKey = findCategoryForTask(activeId);

            if (sourceCategoryKey !== targetCategoryKey) {
                setItems(prev => {
                    return prev.map(t =>
                        t.id === activeId
                            ? { ...t, category_id: targetCategoryKey === 'null' ? null : Number(targetCategoryKey) }
                            : t
                    );
                });
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id;

        // Determine target category
        const overStr = String(overId);
        let targetCategoryKey: string;

        if (overStr.startsWith('category-')) {
            targetCategoryKey = overStr.replace('category-', '');
        } else {
            targetCategoryKey = findCategoryForTask(overId as number);
        }

        const sourceCategoryKey = findCategoryForTask(activeId);

        // Update category if needed
        let newItems = [...items];
        if (sourceCategoryKey !== targetCategoryKey) {
            newItems = newItems.map(t =>
                t.id === activeId
                    ? { ...t, category_id: targetCategoryKey === 'null' ? null : Number(targetCategoryKey) }
                    : t
            );
        }

        // Reorder within the target category
        if (typeof overId === 'number' && activeId !== overId) {
            const targetTasks = newItems.filter(t => {
                const key = t.category_id !== null ? String(t.category_id) : 'null';
                return key === targetCategoryKey;
            });

            const oldIndex = targetTasks.findIndex(t => t.id === activeId);
            const newIndex = targetTasks.findIndex(t => t.id === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                const [movedItem] = targetTasks.splice(oldIndex, 1);
                targetTasks.splice(newIndex, 0, movedItem);

                // Rebuild items preserving order of other categories
                const otherItems = newItems.filter(t => {
                    const key = t.category_id !== null ? String(t.category_id) : 'null';
                    return key !== targetCategoryKey;
                });

                newItems = [...otherItems, ...targetTasks];
            }
        }

        setItems(newItems);

        // Send reorder to server
        router.post(route('tasks.reorder'), {
            order: newItems.map(t => ({ id: t.id, category_id: t.category_id })),
        }, { preserveState: true });
    };

    if (sortMode === 'deadline') {
        const sortedActive = [...activeTasks].sort((a, b) => {
            // Tasks with deadline before tasks without
            if (!!a.deadline !== !!b.deadline) return a.deadline ? -1 : 1;
            // Earliest deadline first
            if (a.deadline && b.deadline) {
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            }
            return 0;
        });

        return (
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {sortedActive.map((task) => (
                        <TaskItem key={task.id} task={task} settings={settings} sortMode="deadline" />
                    ))}
                </AnimatePresence>
                <ArchiveSection tasks={completedTasks} categories={categories} settings={settings} />
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-4">
                {categories.map((category) => (
                    <CategorySection
                        key={category.id}
                        category={category}
                        categories={categories}
                        tasks={groupedTasks[String(category.id)] ?? []}
                        settings={settings}
                    />
                ))}
                <CategorySection
                    category={null}
                    categories={categories}
                    tasks={groupedTasks['null'] ?? []}
                    settings={settings}
                />
                <ArchiveSection tasks={completedTasks} categories={categories} settings={settings} />
            </div>
        </DndContext>
    );
}
