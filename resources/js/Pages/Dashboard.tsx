import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import StatsGrid from '@/components/dashboard/StatsGrid';
import CompletionChart from '@/components/dashboard/CompletionChart';
import PomodoroChart from '@/components/dashboard/PomodoroChart';
import TimePeriodFilter from '@/components/dashboard/TimePeriodFilter';
import TimerWidget from '@/components/timer/TimerWidget';
import type { DashboardStats, Settings, Task } from '@/types';

interface DashboardProps {
    stats: DashboardStats;
    period: string;
    recentTasks: Task[];
    settings: Settings;
}

export default function Dashboard({ stats, period, recentTasks, settings }: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <TimePeriodFilter current={period} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <StatsGrid stats={stats} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CompletionChart data={stats.daily} />
                            <PomodoroChart data={stats.daily} />
                        </div>
                    </div>
                    <div>
                        <TimerWidget />
                    </div>
                </div>
            </motion.div>
        </>
    );
}
