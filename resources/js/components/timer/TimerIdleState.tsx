import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Hourglass from './Hourglass';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TimerIdleState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-8"
        >
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
                <Hourglass animate={false} />
            </motion.div>
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">
                    Kein Timer aktiv
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">
                    Wähle einen Task aus deiner Liste, um einen Pomodoro zu starten.
                </p>
            </div>
            <Link href="/tasks">
                <Button variant="outline" className="rounded-xl border-pink-200 hover:bg-pink-50">
                    Zur Task-Liste
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </Link>
        </motion.div>
    );
}
