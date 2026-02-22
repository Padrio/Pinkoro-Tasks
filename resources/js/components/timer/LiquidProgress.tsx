import { useId } from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '@/lib/formatTime';

interface LiquidProgressProps {
    progress: number; // 0 to 1
    seconds: number;
    size?: number;
}

export default function LiquidProgress({ progress, seconds, size = 200 }: LiquidProgressProps) {
    const id = useId();
    const percent = Math.round(progress * 100);
    const fillHeight = size * progress;
    const isLarge = size > 250;
    const textSize = isLarge ? 'text-6xl' : 'text-4xl';
    const subTextSize = isLarge ? 'text-lg' : 'text-sm';
    const textY1 = size / 2 - (isLarge ? 12 : 8);
    const textY2 = size / 2 + (isLarge ? 28 : 20);

    return (
        <div className="flex flex-col items-center gap-3">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto" style={{ maxWidth: size }}>
                <defs>
                    <clipPath id={`circle-clip-${id}`}>
                        <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} />
                    </clipPath>
                    <linearGradient id={`liquid-gradient-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#C4B5FD" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#F9A8D4" stopOpacity={0.9} />
                    </linearGradient>
                </defs>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - 4}
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={3}
                />
                {/* Liquid fill */}
                <g clipPath={`url(#circle-clip-${id})`}>
                    <motion.rect
                        x={0}
                        width={size}
                        height={size}
                        fill={`url(#liquid-gradient-${id})`}
                        animate={{ y: size - fillHeight }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    {/* Wave 1 */}
                    <motion.path
                        fill="rgba(255,255,255,0.15)"
                        animate={{
                            d: [
                                `M 0 ${size - fillHeight + 8} Q ${size * 0.25} ${size - fillHeight - 4}, ${size * 0.5} ${size - fillHeight + 8} T ${size} ${size - fillHeight + 8} V ${size} H 0 Z`,
                                `M 0 ${size - fillHeight - 4} Q ${size * 0.25} ${size - fillHeight + 8}, ${size * 0.5} ${size - fillHeight - 4} T ${size} ${size - fillHeight - 4} V ${size} H 0 Z`,
                                `M 0 ${size - fillHeight + 8} Q ${size * 0.25} ${size - fillHeight - 4}, ${size * 0.5} ${size - fillHeight + 8} T ${size} ${size - fillHeight + 8} V ${size} H 0 Z`,
                            ],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* Wave 2 */}
                    <motion.path
                        fill="rgba(255,255,255,0.1)"
                        animate={{
                            d: [
                                `M 0 ${size - fillHeight - 3} Q ${size * 0.25} ${size - fillHeight + 6}, ${size * 0.5} ${size - fillHeight - 3} T ${size} ${size - fillHeight - 3} V ${size} H 0 Z`,
                                `M 0 ${size - fillHeight + 6} Q ${size * 0.25} ${size - fillHeight - 3}, ${size * 0.5} ${size - fillHeight + 6} T ${size} ${size - fillHeight + 6} V ${size} H 0 Z`,
                                `M 0 ${size - fillHeight - 3} Q ${size * 0.25} ${size - fillHeight + 6}, ${size * 0.5} ${size - fillHeight - 3} T ${size} ${size - fillHeight - 3} V ${size} H 0 Z`,
                            ],
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    />
                </g>
                {/* Border circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - 4}
                    fill="none"
                    stroke="rgba(249,168,212,0.4)"
                    strokeWidth={3}
                />
                {/* Text */}
                <text
                    x={size / 2}
                    y={textY1}
                    textAnchor="middle"
                    className={`font-mono-timer ${textSize} font-bold`}
                    fill="#1f2937"
                >
                    {formatTime(seconds)}
                </text>
                <text
                    x={size / 2}
                    y={textY2}
                    textAnchor="middle"
                    className={`${subTextSize} font-semibold`}
                    fill="#6b7280"
                >
                    {percent}%
                </text>
            </svg>
        </div>
    );
}
