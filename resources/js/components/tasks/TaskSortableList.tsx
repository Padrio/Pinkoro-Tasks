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
    SortableContext,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import CategorySection from './CategorySection';
import ArchiveSection from './ArchiveSection';
import TaskItem from './TaskItem';
import { getAllCategories } from '@/lib/categoryUtils';
import type { Task, Category, Settings } from '@/types';

interface TaskSortableListProps {
    tasks: Task[];
    categories: Category[];
    settings: Settings;
    sortMode?: 'manual' | 'deadline' | 'priority';
}

export default function TaskSortableList({ tasks, categories, settings, sortMode = 'manual' }: TaskSortableListProps) {
    const [items, setItems] = useState(tasks);
    const [categoryOrder, setCategoryOrder] = useState(categories.map(c => c.id));

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    // Sync with server data (include is_completed to re-sync on toggle)
    const taskIds = tasks.map(t => `${t.id}-${t.category_id}-${t.is_completed}-${t.actual_minutes}-${t.pomodoro_count}`).join(',');
    const itemIds = items.map(t => `${t.id}-${t.category_id}-${t.is_completed}-${t.actual_minutes}-${t.pomodoro_count}`).join(',');
    if (taskIds !== itemIds) {
        setItems(tasks);
    }

    // Sync category order with server data
    const serverCatIds = categories.map(c => c.id).join(',');
    const localCatIds = categoryOrder.join(',');
    if (serverCatIds !== localCatIds) {
        setCategoryOrder(categories.map(c => c.id));
    }

    const orderedCategories = useMemo(() => {
        return categoryOrder
            .map(id => categories.find(c => c.id === id))
            .filter((c): c is Category => c !== undefined);
    }, [categoryOrder, categories]);

    const categorySortableIds = useMemo(() => categoryOrder.map(id => `cat-${id}`), [categoryOrder]);

    // All categories including subcategories (flat)
    const allCategories = useMemo(() => getAllCategories(categories), [categories]);

    // Separate active and completed tasks
    const activeTasks = useMemo(() => items.filter(t => !t.is_completed), [items]);
    const completedTasks = useMemo(() => items.filter(t => t.is_completed), [items]);

    // Group active tasks by category (including subcategory IDs)
    const groupedTasks = useMemo(() => {
        const groups: Record<string, Task[]> = {};

        // Initialize groups for each category and subcategory
        for (const cat of allCategories) {
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
    }, [activeTasks, allCategories]);

    const findCategoryForTask = (taskId: number): string => {
        for (const [key, tasks] of Object.entries(groupedTasks)) {
            if (tasks.some(t => t.id === taskId)) return key;
        }
        return 'null';
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        // Ignore category and subcategory drags in handleDragOver
        if (String(active.id).startsWith('cat-') || String(active.id).startsWith('subcat-')) return;

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

        // Handle category reorder
        if (String(active.id).startsWith('cat-') && String(over.id).startsWith('cat-')) {
            const activeIdx = categoryOrder.indexOf(Number(String(active.id).replace('cat-', '')));
            const overIdx = categoryOrder.indexOf(Number(String(over.id).replace('cat-', '')));

            if (activeIdx !== -1 && overIdx !== -1 && activeIdx !== overIdx) {
                const newOrder = [...categoryOrder];
                const [moved] = newOrder.splice(activeIdx, 1);
                newOrder.splice(overIdx, 0, moved);
                setCategoryOrder(newOrder);

                router.post(route('categories.reorder'), {
                    order: newOrder,
                }, { preserveState: true });
            }
            return;
        }

        // Ignore if a category was dropped on a non-category
        if (String(active.id).startsWith('cat-')) return;

        // Handle subcategory drag
        if (String(active.id).startsWith('subcat-')) {
            const subcatId = Number(String(active.id).replace('subcat-', ''));
            const overStr = String(over.id);

            // Find current parent of the dragged subcategory
            const findSubcatParent = (id: number): Category | undefined => {
                return categories.find(c => c.children?.some(ch => ch.id === id));
            };

            // Dropped onto another subcategory → reorder within parent
            if (overStr.startsWith('subcat-')) {
                const overSubcatId = Number(overStr.replace('subcat-', ''));
                const parent = findSubcatParent(subcatId);
                if (parent?.children) {
                    const children = [...parent.children];
                    const activeIdx = children.findIndex(c => c.id === subcatId);
                    const overIdx = children.findIndex(c => c.id === overSubcatId);

                    if (activeIdx !== -1 && overIdx !== -1 && activeIdx !== overIdx) {
                        const [moved] = children.splice(activeIdx, 1);
                        children.splice(overIdx, 0, moved);

                        router.post(route('categories.reorder'), {
                            order: children.map(c => c.id),
                        }, { preserveState: true });
                    }
                }
                return;
            }

            // Dropped onto a task → move that task + all below it into the subcategory
            const overTaskId = Number(over.id);
            if (!isNaN(overTaskId) && !overStr.startsWith('cat-') && !overStr.startsWith('subcat-') && !overStr.startsWith('category-')) {
                const taskCatKey = findCategoryForTask(overTaskId);
                const tasksInGroup = groupedTasks[taskCatKey] ?? [];
                const dropIndex = tasksInGroup.findIndex(t => t.id === overTaskId);

                if (dropIndex !== -1) {
                    // Tasks from the drop position onward → move into subcategory
                    const tasksToMove = tasksInGroup.slice(dropIndex);
                    const taskIdsToMove = new Set(tasksToMove.map(t => t.id));

                    // Determine target parent: the top-level category the task belongs to
                    const taskCatId = taskCatKey === 'null' ? null : Number(taskCatKey);
                    let targetParentId: number | null = null;
                    if (taskCatId !== null) {
                        const topLevel = categories.find(c => c.id === taskCatId);
                        if (topLevel) {
                            targetParentId = topLevel.id;
                        } else {
                            // Task is in a subcategory — find the parent
                            for (const cat of categories) {
                                if (cat.children?.some(ch => ch.id === taskCatId)) {
                                    targetParentId = cat.id;
                                    break;
                                }
                            }
                        }
                    }

                    // Move subcategory to the correct parent if needed
                    const currentParent = findSubcatParent(subcatId);
                    if (targetParentId !== null && currentParent?.id !== targetParentId) {
                        router.put(route('categories.update', subcatId), {
                            name: allCategories.find(c => c.id === subcatId)?.name ?? '',
                            parent_id: targetParentId,
                        }, { preserveState: true });
                    }

                    // Move tasks into the subcategory
                    const newItems = items.map(t =>
                        taskIdsToMove.has(t.id)
                            ? { ...t, category_id: subcatId }
                            : t
                    );
                    setItems(newItems);

                    router.post(route('tasks.reorder'), {
                        order: newItems.map(t => ({ id: t.id, category_id: t.category_id })),
                    }, { preserveState: true });
                }
            }
            // Dropped onto a category header → move subcategory to that parent
            else if (overStr.startsWith('cat-')) {
                const targetParentId = Number(overStr.replace('cat-', ''));
                const currentParent = findSubcatParent(subcatId);
                if (currentParent?.id !== targetParentId) {
                    router.put(route('categories.update', subcatId), {
                        name: allCategories.find(c => c.id === subcatId)?.name ?? '',
                        parent_id: targetParentId,
                    }, { preserveState: true });
                }
            }
            // Dropped onto a subcategory's droppable zone (category-{id}) — treat as reorder if sibling
            else if (overStr.startsWith('category-')) {
                const overCatId = Number(overStr.replace('category-', ''));
                const parent = findSubcatParent(subcatId);
                if (parent?.children?.some(c => c.id === overCatId)) {
                    const children = [...parent.children];
                    const activeIdx = children.findIndex(c => c.id === subcatId);
                    const overIdx = children.findIndex(c => c.id === overCatId);

                    if (activeIdx !== -1 && overIdx !== -1 && activeIdx !== overIdx) {
                        const [moved] = children.splice(activeIdx, 1);
                        children.splice(overIdx, 0, moved);

                        router.post(route('categories.reorder'), {
                            order: children.map(c => c.id),
                        }, { preserveState: true });
                    }
                }
            }
            return;
        }

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

    if (sortMode === 'priority') {
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        const sortedActive = [...activeTasks].sort((a, b) => {
            const aPrio = a.priority ? priorityOrder[a.priority] : 3;
            const bPrio = b.priority ? priorityOrder[b.priority] : 3;
            if (aPrio !== bPrio) return aPrio - bPrio;
            return a.sort_order - b.sort_order;
        });

        return (
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {sortedActive.map((task) => (
                        <TaskItem key={task.id} task={task} settings={settings} sortMode="priority" />
                    ))}
                </AnimatePresence>
                <ArchiveSection tasks={completedTasks} categories={categories} settings={settings} />
            </div>
        );
    }

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
                <SortableContext items={categorySortableIds} strategy={verticalListSortingStrategy}>
                    {orderedCategories.map((category) => (
                        <CategorySection
                            key={category.id}
                            category={category}
                            categories={categories}
                            tasks={groupedTasks[String(category.id)] ?? []}
                            subcategoryTasks={groupedTasks}
                            settings={settings}
                            sortableId={`cat-${category.id}`}
                        />
                    ))}
                </SortableContext>
                <CategorySection
                    category={null}
                    categories={categories}
                    tasks={groupedTasks['null'] ?? []}
                    subcategoryTasks={groupedTasks}
                    settings={settings}
                />
                <ArchiveSection tasks={completedTasks} categories={categories} settings={settings} />
            </div>
        </DndContext>
    );
}
