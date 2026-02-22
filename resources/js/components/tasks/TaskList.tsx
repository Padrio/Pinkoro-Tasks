import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, ListTodo } from 'lucide-react';
import TaskForm from './TaskForm';
import TaskSortableList from './TaskSortableList';
import type { Task, Settings } from '@/types';

interface TaskListProps {
    tasks: Task[];
    settings: Settings;
}

export default function TaskList({ tasks, settings }: TaskListProps) {
    const [showCreate, setShowCreate] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Meine Tasks</h2>
                <Button
                    onClick={() => setShowCreate(true)}
                    className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl shadow-lg shadow-pink-200/50"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Neuer Task
                </Button>
            </div>

            {tasks.length === 0 ? (
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
                <TaskSortableList tasks={tasks} settings={settings} />
            )}

            <TaskForm open={showCreate} onClose={() => setShowCreate(false)} />
        </div>
    );
}
