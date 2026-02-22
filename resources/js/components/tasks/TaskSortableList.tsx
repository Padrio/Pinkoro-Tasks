import { useState } from 'react';
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
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import TaskItem from './TaskItem';
import type { Task, Settings } from '@/types';

interface TaskSortableListProps {
    tasks: Task[];
    settings: Settings;
}

export default function TaskSortableList({ tasks, settings }: TaskSortableListProps) {
    const [items, setItems] = useState(tasks);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    // Sync with server data
    if (JSON.stringify(tasks.map(t => t.id)) !== JSON.stringify(items.map(t => t.id))) {
        setItems(tasks);
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((t) => t.id === active.id);
        const newIndex = items.findIndex((t) => t.id === over.id);

        const newItems = [...items];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        setItems(newItems);

        router.post(route('tasks.reorder'), {
            order: newItems.map((t) => t.id),
        }, { preserveState: true });
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {items.map((task) => (
                            <TaskItem key={task.id} task={task} settings={settings} />
                        ))}
                    </AnimatePresence>
                </div>
            </SortableContext>
        </DndContext>
    );
}
