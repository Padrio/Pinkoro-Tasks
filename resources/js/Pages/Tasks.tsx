import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import TaskList from '@/components/tasks/TaskList';
import TimerWidget from '@/components/timer/TimerWidget';
import type { Task, PomodoroSession, Settings } from '@/types';

interface TasksProps {
    tasks: Task[];
    activeSession: PomodoroSession | null;
    settings: Settings;
}

export default function Tasks({ tasks, activeSession, settings }: TasksProps) {
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
                        <TaskList tasks={tasks} settings={settings} />
                    </div>
                    <div>
                        <TimerWidget />
                    </div>
                </div>
            </motion.div>
        </>
    );
}
