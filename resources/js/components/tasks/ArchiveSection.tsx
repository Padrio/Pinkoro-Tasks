import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Archive, CalendarCheck } from 'lucide-react';
import TaskItem from './TaskItem';
import { getAllCategories } from '@/lib/categoryUtils';
import type { Task, Category, Settings } from '@/types';

interface ArchiveSectionProps {
    tasks: Task[];
    categories: Category[];
    settings: Settings;
}

function formatDateLabel(dateKey: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (date.getTime() === today.getTime()) return 'Heute';
    if (date.getTime() === yesterday.getTime()) return 'Gestern';

    return date.toLocaleDateString('de-DE', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
}

function groupByCategory(tasks: Task[], categories: Category[]) {
    const allCats = getAllCategories(categories);
    const groups: { category: Category | null; tasks: Task[] }[] = [];

    for (const cat of allCats) {
        const catTasks = tasks.filter(t => t.category_id === cat.id);
        if (catTasks.length > 0) {
            groups.push({ category: cat, tasks: catTasks });
        }
    }

    const allCatIds = new Set(allCats.map(c => c.id));
    const uncategorized = tasks.filter(t => t.category_id === null || !allCatIds.has(t.category_id));
    if (uncategorized.length > 0) {
        groups.push({ category: null, tasks: uncategorized });
    }

    return groups;
}

function todayKey(): string {
    return new Date().toISOString().split('T')[0];
}

export default function ArchiveSection({ tasks, categories, settings }: ArchiveSectionProps) {
    const [isOpen, setIsOpen] = useState(() => {
        const stored = localStorage.getItem('archive-collapsed');
        return stored !== null ? stored === 'true' : false;
    });
    const [openDates, setOpenDates] = useState<Set<string>>(() => new Set([todayKey()]));
    const [closedCategories, setClosedCategories] = useState<Set<string>>(() => new Set());

    useEffect(() => {
        localStorage.setItem('archive-collapsed', String(isOpen));
    }, [isOpen]);

    const toggleDate = (dateKey: string) => {
        setOpenDates(prev => {
            const next = new Set(prev);
            if (next.has(dateKey)) next.delete(dateKey);
            else next.add(dateKey);
            return next;
        });
    };

    const toggleCategory = (key: string) => {
        setClosedCategories(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    // Group by completion date (newest first), then by category within each date
    const dateGroups = useMemo(() => {
        const byDate = new Map<string, Task[]>();

        for (const task of tasks) {
            const dateKey = task.completed_at
                ? task.completed_at.split('T')[0]
                : 'unknown';
            if (!byDate.has(dateKey)) byDate.set(dateKey, []);
            byDate.get(dateKey)!.push(task);
        }

        // Sort date keys newest first
        const sortedKeys = [...byDate.keys()].sort((a, b) => b.localeCompare(a));

        return sortedKeys.map(dateKey => ({
            dateKey,
            label: dateKey === 'unknown' ? 'Unbekannt' : formatDateLabel(dateKey),
            categoryGroups: groupByCategory(byDate.get(dateKey)!, categories),
            count: byDate.get(dateKey)!.length,
        }));
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
                <div className="pl-4 mt-2 space-y-1">
                    {dateGroups.map(({ dateKey, label, categoryGroups, count }) => {
                        const dateOpen = openDates.has(dateKey);
                        return (
                            <Collapsible key={dateKey} open={dateOpen} onOpenChange={() => toggleDate(dateKey)}>
                                <CollapsibleTrigger asChild>
                                    <button className="flex items-center gap-2 w-full text-left py-1.5 px-1 rounded-lg hover:bg-white/30 transition-colors">
                                        <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dateOpen ? 'rotate-90' : ''}`} />
                                        <CalendarCheck className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-sm font-semibold text-gray-500">
                                            {label}
                                        </span>
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-400 border-0 text-xs">
                                            {count}
                                        </Badge>
                                    </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="pl-4 mt-1 mb-2 space-y-1">
                                        {categoryGroups.map(({ category, tasks: groupTasks }) => {
                                            const catKey = `${dateKey}-${category?.id ?? 'none'}`;
                                            const catOpen = !closedCategories.has(catKey);
                                            return (
                                                <Collapsible key={catKey} open={catOpen} onOpenChange={() => toggleCategory(catKey)}>
                                                    <CollapsibleTrigger asChild>
                                                        <button className="flex items-center gap-1.5 w-full text-left py-1 px-1 rounded-lg hover:bg-white/30 transition-colors">
                                                            <ChevronRight className={`w-3 h-3 text-gray-300 transition-transform ${catOpen ? 'rotate-90' : ''}`} />
                                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                                {category?.name ?? 'Ohne Kategorie'}
                                                            </span>
                                                            <span className="text-xs text-gray-300">({groupTasks.length})</span>
                                                        </button>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="pl-3 mt-1 mb-1 space-y-2">
                                                            <AnimatePresence mode="popLayout">
                                                                {groupTasks.map((task) => (
                                                                    <TaskItem key={task.id} task={task} settings={settings} sortMode="deadline" />
                                                                ))}
                                                            </AnimatePresence>
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            );
                                        })}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
