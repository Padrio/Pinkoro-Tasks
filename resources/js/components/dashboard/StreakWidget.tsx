import { motion } from 'framer-motion';
import { Flame, AlertTriangle } from 'lucide-react';

interface StreakData {
    current_streak: number;
    longest_streak: number;
    today_completed: boolean;
}

interface StreakWidgetProps {
    streak: StreakData;
}

export default function StreakWidget({ streak }: StreakWidgetProps) {
    const isAtRisk = streak.current_streak > 0 && !streak.today_completed;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', bounce: 0.2 }}
            className="glass p-5"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Day Streak</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <motion.span
                            className="text-4xl font-bold text-gray-800"
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', bounce: 0.4, delay: 0.4 }}
                        >
                            {streak.current_streak}
                        </motion.span>
                        <span className="text-sm text-gray-500">Tage</span>
                    </div>
                </div>
                <div className={`p-3 rounded-xl ${streak.current_streak > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Flame className="w-5 h-5" />
                </div>
            </div>

            {isAtRisk && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 rounded-lg p-2"
                >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Dein Streak ist in Gefahr! Starte heute noch einen Pomodoro.</span>
                </motion.div>
            )}

            <div className="mt-3 pt-3 border-t border-white/30">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Längster Streak</span>
                    <span className="font-semibold text-gray-700">{streak.longest_streak} Tage</span>
                </div>
            </div>
        </motion.div>
    );
}
