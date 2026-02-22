import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, ListTodo, ArrowUpDown, Calendar } from 'lucide-react';
import TaskForm from './TaskForm';
import TaskSortableList from './TaskSortableList';
import CategoryCreateButton from './CategoryCreateButton';
import type { Task, Category, Settings } from '@/types';

interface TaskListProps {
    tasks: Task[];
    categories: Category[];
    settings: Settings;
}

export default function TaskList({ tasks, categories, settings }: TaskListProps) {
    const [showCreate, setShowCreate] = useState(false);
    const [sortMode, setSortMode] = useState<'manual' | 'deadline'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('task_sort_mode') as 'manual' | 'deadline') || 'manual';
        }
        return 'manual';
    });

    useEffect(() => {
        localStorage.setItem('task_sort_mode', sortMode);
    }, [sortMode]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Meine Tasks</h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortMode(sortMode === 'manual' ? 'deadline' : 'manual')}
                        className={`rounded-xl border-pink-200 hover:bg-pink-50 text-xs ${sortMode === 'deadline' ? 'bg-pink-50 text-pink-700' : ''}`}
                    >
                        {sortMode === 'manual' ? (
                            <><ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />Manuell</>
                        ) : (
                            <><Calendar className="w-3.5 h-3.5 mr-1.5" />Nach Deadline</>
                        )}
                    </Button>
                    <CategoryCreateButton />
                    <Button
                        onClick={() => setShowCreate(true)}
                        className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl shadow-lg shadow-pink-200/50"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Neuer Task
                    </Button>
                </div>
            </div>

            {tasks.length === 0 && categories.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass p-12 flex flex-col items-center gap-4 text-center"
                >
                    <ListTodo className="w-12 h-12 text-pink-300" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">Noch keine Tasks</h3>
                        <p className="text-sm text-gray-500">
                            Erstelle deinen ersten Task und starte einen Pomodoro!
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreate(true)}
                        variant="outline"
                        className="rounded-xl border-pink-200 hover:bg-pink-50"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Task erstellen
                    </Button>
                </motion.div>
            ) : (
                <TaskSortableList tasks={tasks} categories={categories} settings={settings} sortMode={sortMode} />
            )}

            <TaskForm open={showCreate} onClose={() => setShowCreate(false)} categories={categories} />
        </div>
    );
}
