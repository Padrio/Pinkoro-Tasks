import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';

interface AchievementToastProps {
    achievements: Array<{
        name: string;
        description: string;
        icon: string;
        tier: string;
    }>;
}

const tierBg: Record<string, string> = {
    bronze: 'from-amber-400 to-amber-600',
    silver: 'from-slate-300 to-slate-500',
    gold: 'from-yellow-400 to-yellow-600',
};

export default function AchievementToast({ achievements }: AchievementToastProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 6000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 80, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                    className="fixed bottom-6 right-6 z-50 max-w-sm"
                >
                    {achievements.map((achievement, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.3 }}
                            className="glass border border-yellow-200/50 p-4 rounded-xl shadow-xl mb-2"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${tierBg[achievement.tier] || tierBg.bronze}`}>
                                    <Award className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-yellow-600 uppercase tracking-wider">
                                        Achievement freigeschaltet!
                                    </p>
                                    <p className="font-bold text-gray-800">{achievement.name}</p>
                                    <p className="text-xs text-gray-500">{achievement.description}</p>
                                </div>
                                <button
                                    onClick={() => setVisible(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
