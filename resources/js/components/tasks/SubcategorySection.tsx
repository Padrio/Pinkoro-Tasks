import { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, GripVertical, Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import type { Task, Category, Settings } from '@/types';

interface SubcategorySectionProps {
    category: Category;
    allCategories: Category[];
    tasks: Task[];
    settings: Settings;
    sortableId: string;
}

export default function SubcategorySection({ category, allCategories, tasks, settings, sortableId }: SubcategorySectionProps) {
    const storageKey = `category-collapsed-sub-${category.id}`;
    const [isOpen, setIsOpen] = useState(() => {
        const stored = localStorage.getItem(storageKey);
        return stored !== null ? stored === 'true' : true;
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(category.name);
    const [showCreate, setShowCreate] = useState(false);

    const droppableId = `category-${category.id}`;
    const { setNodeRef: setDroppableRef } = useDroppable({ id: droppableId });

    const {
        attributes: sortableAttributes,
        listeners: sortableListeners,
        setNodeRef: setSortableRef,
        transform: sortableTransform,
        transition: sortableTransition,
        isDragging: isSortableDragging,
    } = useSortable({ id: sortableId });

    const sortableStyle = {
        transform: CSS.Transform.toString(sortableTransform),
        transition: sortableTransition,
    };

    useEffect(() => {
        localStorage.setItem(storageKey, String(isOpen));
    }, [isOpen, storageKey]);

    const priorityCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const t of tasks) {
            if (t.priority) counts[t.priority] = (counts[t.priority] ?? 0) + 1;
        }
        return counts;
    }, [tasks]);

    const handleRename = () => {
        if (!editName.trim()) return;
        router.put(route('categories.update', category.id), { name: editName.trim() }, {
            preserveState: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleDelete = () => {
        router.delete(route('categories.destroy', category.id), { preserveState: true });
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div
                ref={setSortableRef}
                style={sortableStyle}
                className={`glass p-2 ml-4 group/sub ${isSortableDragging ? 'opacity-50 z-50' : ''}`}
            >
                <div className="flex items-center gap-1.5">
                    <button
                        {...sortableAttributes}
                        {...sortableListeners}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
                    >
                        <GripVertical className="w-3.5 h-3.5" />
                    </button>
                    <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
                            <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                            {isEditing ? (
                                <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="h-6 text-xs rounded-lg border-pink-200"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleRename();
                                            if (e.key === 'Escape') setIsEditing(false);
                                        }}
                                    />
                                    <Button size="sm" variant="ghost" onClick={handleRename} className="h-6 w-6 p-0 text-green-500">
                                        <Check className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-6 w-6 p-0 text-gray-400">
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-sm font-medium text-gray-600 truncate">
                                        {category.name}
                                    </span>
                                    <Badge variant="secondary" className="bg-pink-50 text-pink-500 border-0 text-xs flex items-center gap-1">
                                        {tasks.length}
                                        {priorityCounts.high > 0 && (
                                            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />{priorityCounts.high}</span>
                                        )}
                                        {priorityCounts.medium > 0 && (
                                            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />{priorityCounts.medium}</span>
                                        )}
                                        {priorityCounts.low > 0 && (
                                            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />{priorityCounts.low}</span>
                                        )}
                                    </Badge>
                                </>
                            )}
                        </button>
                    </CollapsibleTrigger>
                    {!isEditing && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowCreate(true)}
                                className="h-6 w-6 p-0 text-pink-400 hover:text-pink-600"
                            >
                                <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setEditName(category.name); setIsEditing(true); }}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            >
                                <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleDelete}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <CollapsibleContent>
                <div ref={setDroppableRef} className="pl-8 mt-2">
                    <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2 min-h-[8px]">
                            <AnimatePresence mode="popLayout">
                                {tasks.map((task) => (
                                    <TaskItem key={task.id} task={task} settings={settings} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </SortableContext>
                </div>
            </CollapsibleContent>

            <TaskForm
                open={showCreate}
                onClose={() => setShowCreate(false)}
                categories={allCategories}
                defaultCategoryId={category.id}
            />
        </Collapsible>
    );
}
