import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: string;
    delay?: number;
}

export default function StatCard({ title, value, icon: Icon, color, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', bounce: 0.2 }}
            className="glass p-5"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <motion.p
                        className="text-3xl font-bold text-gray-800 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: delay + 0.2 }}
                    >
                        {value}
                    </motion.p>
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </motion.div>
    );
}
