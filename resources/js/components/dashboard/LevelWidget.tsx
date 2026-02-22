import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface LevelData {
    level: number;
    title: string;
    current_xp: number;
    current_level_xp: number;
    next_level_xp: number | null;
}

interface LevelWidgetProps {
    level: LevelData;
}

export default function LevelWidget({ level }: LevelWidgetProps) {
    const progressPercent = level.next_level_xp
        ? Math.min(100, Math.round(
            ((level.current_xp - level.current_level_xp) / (level.next_level_xp - level.current_level_xp)) * 100
        ))
        : 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', bounce: 0.2 }}
            className="glass p-5"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Level</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <motion.span
                            className="text-4xl font-bold text-gray-800"
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', bounce: 0.4, delay: 0.45 }}
                        >
                            {level.level}
                        </motion.span>
                        <span className="text-sm font-medium text-purple-600">{level.title}</span>
                    </div>
                </div>
                <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                    <Trophy className="w-5 h-5" />
                </div>
            </div>

            <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{level.current_xp} Min</span>
                    {level.next_level_xp ? (
                        <span>{level.next_level_xp} Min</span>
                    ) : (
                        <span>Max Level!</span>
                    )}
                </div>
                <div className="h-2 rounded-full bg-white/30 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #C4B5FD, #A78BFA)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
