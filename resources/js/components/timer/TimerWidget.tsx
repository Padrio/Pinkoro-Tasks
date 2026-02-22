import { useTimer } from '@/contexts/TimerContext';
import { motion, AnimatePresence } from 'framer-motion';
import CircularProgress from './CircularProgress';
import DigitalDisplay from './DigitalDisplay';
import PercentageDisplay from './PercentageDisplay';
import ProgressBarDisplay from './ProgressBarDisplay';
import LiquidProgress from './LiquidProgress';
import TimerControls from './TimerControls';
import TimerIdleState from './TimerIdleState';
import TimerCompleteDialog from './TimerCompleteDialog';
import { useState, useEffect, useCallback } from 'react';
import { Eye, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TimerDisplayMode } from '@/types';

const DISPLAY_MODES: TimerDisplayMode[] = ['ring_time', 'ring_percent', 'ring_only', 'bar', 'liquid'];
const MODE_LABELS: Record<TimerDisplayMode, string> = {
    ring_time: 'Ring + Zeit',
    ring_percent: 'Ring + Prozent',
    ring_only: 'Nur Ring',
    bar: 'Balken',
    liquid: 'Liquid',
};

interface TimerWidgetProps {
    displayMode?: TimerDisplayMode;
}

export default function TimerWidget({ displayMode: propMode }: TimerWidgetProps) {
    const { status, remainingSeconds, totalSeconds, taskTitle, type } = useTimer();
    const [showComplete, setShowComplete] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const [localMode, setLocalMode] = useState<TimerDisplayMode>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('timer_display_mode') as TimerDisplayMode) || propMode || 'ring_time';
        }
        return propMode || 'ring_time';
    });

    useEffect(() => {
        if (propMode && !localStorage.getItem('timer_display_mode')) {
            setLocalMode(propMode);
        }
    }, [propMode]);

    const currentMode = localMode;

    const cycleMode = () => {
        const currentIndex = DISPLAY_MODES.indexOf(currentMode);
        const nextMode = DISPLAY_MODES[(currentIndex + 1) % DISPLAY_MODES.length];
        setLocalMode(nextMode);
        localStorage.setItem('timer_display_mode', nextMode);
    };

    useEffect(() => {
        if (status === 'completed') {
            setShowComplete(true);
            setExpanded(false);
        }
    }, [status]);

    // Close expanded view on Escape
    useEffect(() => {
        if (!expanded) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setExpanded(false);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [expanded]);

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
    const elapsed = 1 - progress;
    const typeLabel: Record<string, string> = {
        pomodoro: 'Pomodoro',
        short_break: 'Kurze Pause',
        long_break: 'Lange Pause',
        custom: 'Custom',
    };

    const renderDisplay = (large = false) => {
        const ringSize = large ? 360 : 200;

        switch (currentMode) {
            case 'ring_time':
                return (
                    <div className="relative flex items-center justify-center" style={large ? { width: ringSize, height: ringSize } : undefined}>
                        <CircularProgress progress={progress} size={ringSize} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <DigitalDisplay seconds={remainingSeconds} className={large ? 'text-7xl' : ''} />
                        </div>
                    </div>
                );
            case 'ring_percent':
                return (
                    <div className="relative flex items-center justify-center" style={large ? { width: ringSize, height: ringSize } : undefined}>
                        <CircularProgress progress={progress} size={ringSize} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <PercentageDisplay progress={elapsed} className={large ? 'text-7xl' : ''} />
                        </div>
                    </div>
                );
            case 'ring_only':
                return (
                    <div className="relative flex items-center justify-center" style={large ? { width: ringSize, height: ringSize } : undefined}>
                        <CircularProgress progress={progress} size={ringSize} />
                    </div>
                );
            case 'bar':
                return (
                    <div className={large ? 'w-full max-w-lg' : 'w-full'}>
                        <ProgressBarDisplay progress={elapsed} seconds={remainingSeconds} large={large} />
                    </div>
                );
            case 'liquid':
                return (
                    <div className="flex items-center justify-center" style={large ? { width: ringSize, height: ringSize } : undefined}>
                        <LiquidProgress progress={elapsed} seconds={remainingSeconds} size={large ? ringSize : 200} />
                    </div>
                );
            default:
                return null;
        }
    };

    const isActive = status === 'running' || status === 'paused' || status === 'completed';

    return (
        <>
            {/* Normal widget */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.2 }}
                className="glass p-6 overflow-hidden"
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-between w-full">
                        {taskTitle ? (
                            <div className="text-center flex-1">
                                <p className="text-sm text-gray-500 font-medium">{typeLabel[type]}</p>
                                <h3 className="text-lg font-semibold text-gray-800">{taskTitle}</h3>
                            </div>
                        ) : (
                            <div className="flex-1" />
                        )}
                        <div className="flex items-center gap-1">
                            {isActive && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpanded(true)}
                                    className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
                                    title="Vergrößern"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={cycleMode}
                                className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
                                title={MODE_LABELS[currentMode]}
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    {renderDisplay()}
                    <TimerControls />
                </div>
            </motion.div>

            {/* Fullscreen overlay */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center"
                        onClick={() => setExpanded(false)}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/95 via-white/95 to-purple-50/95 backdrop-blur-xl" />

                        {/* Content */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', bounce: 0.2 }}
                            className="relative flex flex-col items-center gap-8 p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button - z-50 to stay above scaled content */}
                            <button
                                onClick={() => setExpanded(false)}
                                className="absolute top-0 right-0 z-50 text-gray-400 hover:text-gray-600 h-10 w-10 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                                title="Verkleinern (Esc)"
                            >
                                <Minimize2 className="w-5 h-5" />
                            </button>

                            {/* Task info */}
                            {taskTitle && (
                                <div className="text-center">
                                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">
                                        {typeLabel[type]}
                                    </p>
                                    <h2 className="text-2xl font-bold text-gray-800 mt-1">{taskTitle}</h2>
                                </div>
                            )}

                            {/* Large timer display */}
                            {renderDisplay(true)}

                            {/* Controls */}
                            <TimerControls />

                            {/* Mode toggle */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={cycleMode}
                                className="text-gray-400 hover:text-gray-600 text-xs"
                            >
                                <Eye className="w-3.5 h-3.5 mr-1.5" />
                                {MODE_LABELS[currentMode]}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <TimerCompleteDialog
                open={showComplete}
                onClose={() => setShowComplete(false)}
            />
        </>
    );
}
