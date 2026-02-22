import StatCard from './StatCard';
import { CheckCircle, Timer, Clock, TrendingUp, Target, Zap } from 'lucide-react';
import type { DashboardStats } from '@/types';
import { formatMinutes } from '@/lib/formatTime';

interface StatsGridProps {
    stats: DashboardStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
    const cards = [
        {
            title: 'Tasks erledigt',
            value: stats.tasks_completed,
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600',
        },
        {
            title: 'Pomodoros',
            value: stats.pomodoro_count,
            icon: Timer,
            color: 'bg-pink-100 text-pink-600',
        },
        {
            title: 'Fokuszeit',
            value: formatMinutes(stats.pomodoro_minutes),
            icon: Clock,
            color: 'bg-purple-100 text-purple-600',
        },
        {
            title: 'Pomodoros/Task',
            value: stats.avg_pomodoros_per_task,
            icon: TrendingUp,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Min/Session',
            value: stats.avg_minutes_per_session,
            icon: Target,
            color: 'bg-orange-100 text-orange-600',
        },
        {
            title: 'Gesamtzeit',
            value: formatMinutes(stats.total_minutes),
            icon: Zap,
            color: 'bg-yellow-100 text-yellow-600',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cards.map((card, index) => (
                <StatCard key={card.title} {...card} delay={index * 0.05} />
            ))}
        </div>
    );
}
