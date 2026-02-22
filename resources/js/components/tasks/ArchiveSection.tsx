import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Archive } from 'lucide-react';
import TaskItem from './TaskItem';
import type { Task, Category, Settings } from '@/types';

interface ArchiveSectionProps {
    tasks: Task[];
    categories: Category[];
    settings: Settings;
}

export default function ArchiveSection({ tasks, categories, settings }: ArchiveSectionProps) {
    const [isOpen, setIsOpen] = useState(() => {
        const stored = localStorage.getItem('archive-collapsed');
        return stored !== null ? stored === 'true' : false;
    });

    useEffect(() => {
        localStorage.setItem('archive-collapsed', String(isOpen));
    }, [isOpen]);

    // Group completed tasks by category
    const grouped = useMemo(() => {
        const groups: { category: Category | null; tasks: Task[] }[] = [];

        for (const cat of categories) {
            const catTasks = tasks.filter(t => t.category_id === cat.id);
            if (catTasks.length > 0) {
                groups.push({ category: cat, tasks: catTasks });
            }
        }

        const uncategorized = tasks.filter(t => t.category_id === null);
        if (uncategorized.length > 0) {
            groups.push({ category: null, tasks: uncategorized });
        }

        return groups;
    }, [tasks, categories]);

    if (tasks.length === 0) return null;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="glass p-3 opacity-75">
                <div className="flex items-center gap-2">
                    <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-2 flex-1 min-w-0 text-left">
                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                            <Archive className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-gray-500 truncate">
                                Archiv
                            </span>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-0 text-xs">
                                {tasks.length}
                            </Badge>
                        </button>
                    </CollapsibleTrigger>
                </div>
            </div>
            <CollapsibleContent>
                <div className="pl-4 mt-2 space-y-3">
                    {grouped.map(({ category, tasks: groupTasks }) => (
                        <div key={category?.id ?? 'none'}>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                                {category?.name ?? 'Ohne Kategorie'}
                                <span className="text-gray-300 ml-1.5">({groupTasks.length})</span>
                            </p>
                            <div className="space-y-2">
                                <AnimatePresence mode="popLayout">
                                    {groupTasks.map((task) => (
                                        <TaskItem key={task.id} task={task} settings={settings} sortMode="deadline" />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
