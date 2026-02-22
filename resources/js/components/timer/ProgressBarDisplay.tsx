import { motion } from 'framer-motion';
import { formatTime } from '@/lib/formatTime';

interface ProgressBarDisplayProps {
    progress: number; // 0 to 1
    seconds: number;
    large?: boolean;
}

export default function ProgressBarDisplay({ progress, seconds, large = false }: ProgressBarDisplayProps) {
    const percent = Math.round(progress * 100);

    return (
        <div className="w-full space-y-3">
            <div className={`relative rounded-full bg-white/30 overflow-hidden ${large ? 'h-10' : 'h-6'}`}>
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, #F9A8D4, #C4B5FD)',
                    }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                />
            </div>
            <div className="flex items-center justify-between">
                <span className={`font-mono-timer font-bold tabular-nums text-gray-800 ${large ? 'text-5xl' : 'text-2xl'}`}>
                    {formatTime(seconds)}
                </span>
                <span className={`font-mono-timer font-semibold text-gray-500 ${large ? 'text-3xl' : 'text-lg'}`}>
                    {percent}%
                </span>
            </div>
        </div>
    );
}
