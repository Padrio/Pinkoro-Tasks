import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import TaskList from '@/components/tasks/TaskList';
import TimerWidget from '@/components/timer/TimerWidget';
import type { Task, Category, PomodoroSession, Settings } from '@/types';

interface TasksProps {
    tasks: Task[];
    categories: Category[];
    activeSession: PomodoroSession | null;
    settings: Settings;
}

export default function Tasks({ tasks, categories, activeSession, settings }: TasksProps) {
    return (
        <>
            <Head title="Tasks" />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <TaskList tasks={tasks} categories={categories} settings={settings} />
                    </div>
                    <div>
                        <TimerWidget displayMode={settings.timer_display_mode} />
                    </div>
                </div>
            </motion.div>
        </>
    );
}
