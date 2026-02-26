import { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, GripVertical, Pencil, Trash2, Check, X, Plus, FolderPlus } from 'lucide-react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import SubcategorySection from './SubcategorySection';
import type { Task, Category, Settings } from '@/types';

interface CategorySectionProps {
    category: Category | null;
    categories: Category[];
    tasks: Task[];
    subcategoryTasks?: Record<string, Task[]>;
    settings: Settings;
    sortableId?: string;
}

export default function CategorySection({ category, categories, tasks, subcategoryTasks = {}, settings, sortableId }: CategorySectionProps) {
    const storageKey = `category-collapsed-${category?.id ?? 'uncategorized'}`;
    const [isOpen, setIsOpen] = useState(() => {
        const stored = localStorage.getItem(storageKey);
        return stored !== null ? stored === 'true' : true;
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(category?.name ?? '');
    const [showCreate, setShowCreate] = useState(false);
    const [showSubcategoryInput, setShowSubcategoryInput] = useState(false);
    const [subcategoryName, setSubcategoryName] = useState('');

    const droppableId = `category-${category?.id ?? 'null'}`;
    const { setNodeRef } = useDroppable({ id: droppableId });

    const {
        attributes: sortableAttributes,
        listeners: sortableListeners,
        setNodeRef: setSortableNodeRef,
        transform: sortableTransform,
        transition: sortableTransition,
        isDragging: isSortableDragging,
    } = useSortable({ id: sortableId ?? '', disabled: !sortableId });

    const sortableStyle = sortableId ? {
        transform: CSS.Transform.toString(sortableTransform),
        transition: sortableTransition,
    } : undefined;

    useEffect(() => {
        localStorage.setItem(storageKey, String(isOpen));
    }, [isOpen, storageKey]);

    const subcategories = category?.children ?? [];

    // Count total tasks including subcategory tasks
    const subcategoryTaskCount = subcategories.reduce((sum, sub) => {
        return sum + (subcategoryTasks[String(sub.id)]?.length ?? 0);
    }, 0);
    const totalTaskCount = tasks.length + subcategoryTaskCount;

    // Unified sortable IDs: tasks first, then subcategories — all in one SortableContext
    const unifiedSortableIds = useMemo(() => {
        const ids: (number | string)[] = tasks.map(t => t.id);
        for (const sub of subcategories) {
            ids.push(`subcat-${sub.id}`);
        }
        return ids;
    }, [tasks, subcategories]);

    const handleRename = () => {
        if (!category || !editName.trim()) return;
        router.put(route('categories.update', category.id), { name: editName.trim() }, {
            preserveState: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleDelete = () => {
        if (!category) return;
        router.delete(route('categories.destroy', category.id), { preserveState: true });
    };

    const handleCreateSubcategory = () => {
        if (!category || !subcategoryName.trim()) return;
        router.post(route('categories.store'), {
            name: subcategoryName.trim(),
            parent_id: category.id,
        }, {
            preserveState: true,
            onSuccess: () => {
                setSubcategoryName('');
                setShowSubcategoryInput(false);
            },
        });
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div
                ref={sortableId ? setSortableNodeRef : undefined}
                style={sortableStyle}
                className={`glass p-3 group ${isSortableDragging ? 'opacity-50 z-50' : ''}`}
            >
                <div className="flex items-center gap-2">
                    {sortableId && (
                        <button
                            {...sortableAttributes}
                            {...sortableListeners}
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
                        >
                            <GripVertical className="w-4 h-4" />
                        </button>
                    )}
                    <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-2 flex-1 min-w-0 text-left">
                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                            {isEditing && category ? (
                                <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="h-7 text-sm rounded-lg border-pink-200"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleRename();
                                            if (e.key === 'Escape') setIsEditing(false);
                                        }}
                                    />
                                    <Button size="sm" variant="ghost" onClick={handleRename} className="h-7 w-7 p-0 text-green-500">
                                        <Check className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-7 w-7 p-0 text-gray-400">
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-semibold text-gray-700 truncate">
                                        {category?.name ?? 'Ohne Kategorie'}
                                    </span>
                                    <Badge variant="secondary" className="bg-pink-100 text-pink-600 border-0 text-xs">
                                        {totalTaskCount}
                                    </Badge>
                                </>
                            )}
                        </button>
                    </CollapsibleTrigger>
                    {!isEditing && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowCreate(true)}
                                className="h-7 w-7 p-0 text-pink-400 hover:text-pink-600"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </Button>
                            {category && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowSubcategoryInput(true)}
                                        className="h-7 w-7 p-0 text-purple-400 hover:text-purple-600"
                                        title="Unterkategorie erstellen"
                                    >
                                        <FolderPlus className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => { setEditName(category.name); setIsEditing(true); }}
                                        className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleDelete}
                                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <CollapsibleContent>
                {/* Inline subcategory creation */}
                <AnimatePresence>
                    {showSubcategoryInput && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 mt-2"
                        >
                            <div className="flex items-center gap-2">
                                <Input
                                    value={subcategoryName}
                                    onChange={(e) => setSubcategoryName(e.target.value)}
                                    placeholder="Unterkategorie-Name..."
                                    className="h-7 text-sm rounded-lg border-purple-200 flex-1"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateSubcategory();
                                        if (e.key === 'Escape') { setShowSubcategoryInput(false); setSubcategoryName(''); }
                                    }}
                                />
                                <Button size="sm" variant="ghost" onClick={handleCreateSubcategory} className="h-7 w-7 p-0 text-green-500">
                                    <Check className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setShowSubcategoryInput(false); setSubcategoryName(''); }} className="h-7 w-7 p-0 text-gray-400">
                                    <X className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Unified SortableContext: tasks + subcategories together so drag between them works */}
                <div ref={setNodeRef} className="pl-4 mt-2">
                    <SortableContext items={unifiedSortableIds} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3 min-h-[8px]">
                            <AnimatePresence mode="popLayout">
                                {tasks.map((task) => (
                                    <TaskItem key={task.id} task={task} settings={settings} />
                                ))}
                            </AnimatePresence>

                            {/* Subcategories rendered in same sortable flow */}
                            {subcategories.map((sub) => (
                                <SubcategorySection
                                    key={sub.id}
                                    category={sub}
                                    allCategories={categories}
                                    tasks={subcategoryTasks[String(sub.id)] ?? []}
                                    settings={settings}
                                    sortableId={`subcat-${sub.id}`}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </div>
            </CollapsibleContent>

            <TaskForm
                open={showCreate}
                onClose={() => setShowCreate(false)}
                categories={categories}
                defaultCategoryId={category?.id ?? null}
            />
        </Collapsible>
    );
}
