import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface ProductivityScoreProps {
    score: number; // 0-100
}

export default function ProductivityScore({ score }: ProductivityScoreProps) {
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - score / 100);

    const getColor = (score: number): string => {
        if (score >= 70) return '#22c55e';
        if (score >= 40) return '#eab308';
        return '#ef4444';
    };

    const getLabel = (score: number): string => {
        if (score >= 80) return 'Exzellent';
        if (score >= 60) return 'Gut';
        if (score >= 40) return 'Okay';
        if (score >= 20) return 'Ausbaufähig';
        return 'Los geht\'s!';
    };

    const color = getColor(score);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', bounce: 0.2 }}
            className="glass p-5"
        >
            <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-800 text-sm">Produktivitäts-Score</h3>
            </div>

            <div className="flex flex-col items-center">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-24 h-24 transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth={strokeWidth}
                    />
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                    />
                </svg>
                <div className="text-center -mt-[60px] mb-2">
                    <motion.span
                        className="text-2xl font-bold text-gray-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        {score}
                    </motion.span>
                </div>
                <p className="text-xs font-medium mt-3" style={{ color }}>
                    {getLabel(score)}
                </p>
            </div>
        </motion.div>
    );
}
