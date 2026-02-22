import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import StatsGrid from '@/components/dashboard/StatsGrid';
import CompletionChart from '@/components/dashboard/CompletionChart';
import PomodoroChart from '@/components/dashboard/PomodoroChart';
import TimePeriodFilter from '@/components/dashboard/TimePeriodFilter';
import UrgencyWidget from '@/components/dashboard/UrgencyWidget';
import StreakWidget from '@/components/dashboard/StreakWidget';
import LevelWidget from '@/components/dashboard/LevelWidget';
import AchievementsWidget from '@/components/dashboard/AchievementsWidget';
import ProductivityScore from '@/components/dashboard/ProductivityScore';
import TimerWidget from '@/components/timer/TimerWidget';
import AchievementToast from '@/components/dashboard/AchievementToast';
import type { DashboardStats, Settings, Task, UrgentTasks } from '@/types';

interface StreakData {
    current_streak: number;
    longest_streak: number;
    today_completed: boolean;
}

interface LevelData {
    level: number;
    title: string;
    current_xp: number;
    current_level_xp: number;
    next_level_xp: number | null;
}

interface AchievementItem {
    id: number;
    key: string;
    name: string;
    description: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold';
    unlocked: boolean;
}

interface DashboardProps {
    stats: DashboardStats;
    period: string;
    recentTasks: Task[];
    urgentTasks: UrgentTasks;
    settings: Settings;
    streak: StreakData;
    level: LevelData;
    score: number;
    achievements: AchievementItem[];
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 11) return 'Guten Morgen, Johanna ☀️';
    if (hour < 17) return 'Guten Tag, Johanna 👋';
    return 'Guten Abend, Johanna 🌙';
}

export default function Dashboard({ stats, period, recentTasks, urgentTasks, settings, streak, level, score, achievements }: DashboardProps) {
    const { props } = usePage();
    const newAchievements = (props as any).flash?.new_achievements as Array<{
        name: string;
        description: string;
        icon: string;
        tier: string;
    }> | undefined;

    return (
        <>
            <Head title="Dashboard" />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                        <p className="text-sm text-gray-500">{getGreeting()}</p>
                    </div>
                    <TimePeriodFilter current={period} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <StatsGrid stats={stats} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StreakWidget streak={streak} />
                            <LevelWidget level={level} />
                        </div>
                        <UrgencyWidget urgentTasks={urgentTasks} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CompletionChart data={stats.daily} />
                            <PomodoroChart data={stats.daily} />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <TimerWidget displayMode={settings.timer_display_mode} />
                        <ProductivityScore score={score} />
                        <AchievementsWidget achievements={achievements} />
                    </div>
                </div>
            </motion.div>

            {newAchievements && newAchievements.length > 0 && (
                <AchievementToast achievements={newAchievements} />
            )}
        </>
    );
}
