import { motion } from 'framer-motion';

interface HourglassProps {
    animate?: boolean;
}

export default function Hourglass({ animate = true }: HourglassProps) {
    return (
        <motion.div
            animate={animate ? { rotate: [0, 0, 180, 180, 0] } : {}}
            transition={animate ? { duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.1, 0.5, 0.9, 1] } : {}}
            className="relative"
        >
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                {/* Top half */}
                <path
                    d="M16 8h32v4c0 8-6 14-16 20C22 26 16 20 16 12V8z"
                    fill="url(#sand-top)"
                    opacity="0.8"
                />
                {/* Bottom half */}
                <path
                    d="M16 56h32v-4c0-8-6-14-16-20C22 38 16 44 16 52v4z"
                    fill="url(#sand-bottom)"
                    opacity="0.6"
                />
                {/* Frame */}
                <path
                    d="M12 6h40M12 58h40M16 6v4c0 10 6 16 16 22-10 6-16 12-16 22v4M48 6v4c0 10-6 16-16 22 10 6 16 12 16 22v4"
                    stroke="#D1A3B8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                {/* Sand stream */}
                {animate && (
                    <motion.line
                        x1="32" y1="28" x2="32" y2="36"
                        stroke="#F9A8D4"
                        strokeWidth="2"
                        strokeLinecap="round"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                )}
                <defs>
                    <linearGradient id="sand-top" x1="32" y1="8" x2="32" y2="32">
                        <stop stopColor="#F9A8D4" />
                        <stop offset="1" stopColor="#FBCFE8" />
                    </linearGradient>
                    <linearGradient id="sand-bottom" x1="32" y1="32" x2="32" y2="56">
                        <stop stopColor="#FBCFE8" />
                        <stop offset="1" stopColor="#F9A8D4" />
                    </linearGradient>
                </defs>
            </svg>
        </motion.div>
    );
}
