import { motion } from 'framer-motion';
import { LucideIcon, ChevronDown } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface BreakdownItem {
    label: string;
    value: string | number;
    sublabel?: string;
}

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: string;
    delay?: number;
    breakdown?: BreakdownItem[];
}

export default function StatCard({ title, value, icon: Icon, color, delay = 0, breakdown }: StatCardProps) {
    const content = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', bounce: 0.2 }}
            className={`glass p-5 ${breakdown ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-1">
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        {breakdown && (
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                        )}
                    </div>
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

    if (!breakdown || breakdown.length === 0) {
        return content;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div>
                    {content}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 glass border-white/50" align="start">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Aufschlüsselung
                </p>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {breakdown.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                            <div className="truncate mr-2">
                                <span className="text-gray-600">{item.label}</span>
                                {item.sublabel && (
                                    <span className="text-gray-400 text-xs ml-1">{item.sublabel}</span>
                                )}
                            </div>
                            <span className="font-semibold text-gray-800 whitespace-nowrap">{item.value}</span>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
