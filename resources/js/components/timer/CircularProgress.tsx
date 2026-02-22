import { motion } from 'framer-motion';

interface CircularProgressProps {
    progress: number; // 0 to 1
    size?: number;
    strokeWidth?: number;
}

export default function CircularProgress({
    progress,
    size = 240,
    strokeWidth = 8,
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - progress);

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <defs>
                <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F9A8D4" />
                    <stop offset="100%" stopColor="#C4B5FD" />
                </linearGradient>
            </defs>
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
                stroke="url(#timer-gradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            />
        </svg>
    );
}
