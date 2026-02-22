import { motion } from 'framer-motion';
import { Award, Rocket, Zap, Flame, Crown, Shield, Trophy, CheckCircle, Star, Clock, Sunrise, Moon, Lock, LucideIcon } from 'lucide-react';

interface AchievementItem {
    id: number;
    key: string;
    name: string;
    description: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold';
    unlocked: boolean;
}

interface AchievementsWidgetProps {
    achievements: AchievementItem[];
}

const iconMap: Record<string, LucideIcon> = {
    rocket: Rocket,
    zap: Zap,
    flame: Flame,
    crown: Crown,
    shield: Shield,
    trophy: Trophy,
    'check-circle': CheckCircle,
    star: Star,
    clock: Clock,
    sunrise: Sunrise,
    moon: Moon,
};

const tierColors: Record<string, string> = {
    bronze: 'bg-amber-100 text-amber-700 border-amber-300',
    silver: 'bg-slate-100 text-slate-600 border-slate-300',
    gold: 'bg-yellow-100 text-yellow-700 border-yellow-400',
};

const tierColorsLocked = 'bg-gray-100 text-gray-300 border-gray-200';

export default function AchievementsWidget({ achievements }: AchievementsWidgetProps) {
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, type: 'spring', bounce: 0.2 }}
            className="glass p-5"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-gray-800">Achievements</h3>
                </div>
                <span className="text-sm text-gray-500">{unlockedCount}/{achievements.length}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {achievements.map((achievement, index) => {
                    const Icon = iconMap[achievement.icon] || Award;
                    return (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.03 }}
                            className={`relative flex flex-col items-center p-2 rounded-lg border ${
                                achievement.unlocked ? tierColors[achievement.tier] : tierColorsLocked
                            }`}
                            title={`${achievement.name}: ${achievement.description}`}
                        >
                            {achievement.unlocked ? (
                                <Icon className="w-5 h-5" />
                            ) : (
                                <Lock className="w-5 h-5" />
                            )}
                            <span className="text-[10px] mt-1 text-center leading-tight truncate w-full">
                                {achievement.unlocked ? achievement.name : '???'}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
