import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { AlertTriangle, Clock, CalendarClock, CheckCircle } from 'lucide-react';
import { formatDeadline, formatMinutes } from '@/lib/formatTime';
import type { UrgentTasks, Task } from '@/types';

interface UrgencyWidgetProps {
    urgentTasks: UrgentTasks;
}

interface SectionProps {
    title: string;
    tasks: Task[];
    icon: React.ReactNode;
    accentColor: string;
    textColor: string;
    bgColor: string;
}

function UrgencySection({ title, tasks, icon, accentColor, textColor, bgColor }: SectionProps) {
    if (tasks.length === 0) return null;

    const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimated_minutes ?? 0), 0);

    return (
        <div className="space-y-2">
            <div className={`flex items-center gap-2 ${textColor}`}>
                {icon}
                <span className="text-sm font-semibold uppercase tracking-wide">{title}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${bgColor} ${textColor}`}>
                    {tasks.length}{totalEstimated > 0 ? ` · ~${formatMinutes(totalEstimated)}` : ''}
                </span>
            </div>
            <div className="space-y-1.5">
                {tasks.map((task) => (
                    <Link
                        key={task.id}
                        href={route('tasks.index')}
                        className={`block p-2.5 rounded-xl ${bgColor} hover:opacity-80 transition-opacity`}
                    >
                        <p className={`text-sm font-medium ${textColor} truncate`}>{task.title}</p>
                        {task.deadline && (
                            <p className={`text-xs ${textColor} opacity-75 mt-0.5`}>
                                {formatDeadline(task.deadline)}
                            </p>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function UrgencyWidget({ urgentTasks }: UrgencyWidgetProps) {
    const hasAny = urgentTasks.overdue.length > 0 ||
        urgentTasks.due_today.length > 0 ||
        urgentTasks.due_soon.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', bounce: 0.2 }}
            className="glass p-5"
        >
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Anstehende Deadlines</h3>

            {!hasAny ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <p className="text-sm text-gray-500">Keine anstehenden Deadlines</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <UrgencySection
                        title="Überfällig"
                        tasks={urgentTasks.overdue}
                        icon={<AlertTriangle className="w-4 h-4" />}
                        accentColor="red"
                        textColor="text-red-700"
                        bgColor="bg-red-50"
                    />
                    <UrgencySection
                        title="Heute fällig"
                        tasks={urgentTasks.due_today}
                        icon={<Clock className="w-4 h-4" />}
                        accentColor="orange"
                        textColor="text-orange-700"
                        bgColor="bg-orange-50"
                    />
                    <UrgencySection
                        title="Bald fällig"
                        tasks={urgentTasks.due_soon}
                        icon={<CalendarClock className="w-4 h-4" />}
                        accentColor="yellow"
                        textColor="text-yellow-700"
                        bgColor="bg-yellow-50"
                    />
                </div>
            )}
        </motion.div>
    );
}
