import { useTimer } from '@/contexts/TimerContext';
import { motion } from 'framer-motion';
import CircularProgress from './CircularProgress';
import DigitalDisplay from './DigitalDisplay';
import TimerControls from './TimerControls';
import TimerIdleState from './TimerIdleState';
import TimerCompleteDialog from './TimerCompleteDialog';
import { useState, useEffect } from 'react';

export default function TimerWidget() {
    const { status, remainingSeconds, totalSeconds, taskTitle, type } = useTimer();
    const [showComplete, setShowComplete] = useState(false);

    useEffect(() => {
        if (status === 'completed') {
            setShowComplete(true);
        }
    }, [status]);

    if (status === 'idle' && !showComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-8"
            >
                <TimerIdleState />
            </motion.div>
        );
    }

    const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
    const typeLabel: Record<string, string> = {
        pomodoro: 'Pomodoro',
        short_break: 'Kurze Pause',
        long_break: 'Lange Pause',
        custom: 'Custom',
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.2 }}
                className="glass p-8"
            >
                <div className="flex flex-col items-center gap-6">
                    {taskTitle && (
                        <div className="text-center">
                            <p className="text-sm text-gray-500 font-medium">{typeLabel[type]}</p>
                            <h3 className="text-lg font-semibold text-gray-800">{taskTitle}</h3>
                        </div>
                    )}
                    <div className="relative flex items-center justify-center">
                        <CircularProgress progress={progress} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <DigitalDisplay seconds={remainingSeconds} />
                        </div>
                    </div>
                    <TimerControls />
                </div>
            </motion.div>
            <TimerCompleteDialog
                open={showComplete}
                onClose={() => setShowComplete(false)}
            />
        </>
    );
}
