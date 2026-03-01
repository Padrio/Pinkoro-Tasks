import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const catMessages = [
    'Miau! Du schaffst das!',
    'Schnurr~ Weiter so!',
    'Prrr... Tolle Arbeit!',
    'Miau! Fokus-Zeit!',
    '*schnurr* Du bist super!',
    'Noch ein Pomodoro? Miau!',
    '*gähn* Pause verdient!',
    'Miau~ Fast geschafft!',
    '*kopfstups* Weiter!',
    'Prrr... Ich glaub an dich!',
    '*streckt sich* Weiter gehts!',
    '*putzt sich* Gut gemacht!',
];

function getRandomMessage() {
    return catMessages[Math.floor(Math.random() * catMessages.length)];
}

type CatPose = 'walk1' | 'walk2' | 'sit' | 'sleep' | 'look';

interface CatColors {
    body: string;
    bodyLight: string;
    head: string;
    tailLegs: string;
    earInner: string;
    eyeIris: string;
    stripes: string;
    showStripes: boolean;
}

const catThemes: CatColors[] = [
    // Gray tabby
    {
        body: '#8B8B8B', bodyLight: '#A0A0A0', head: '#9A9A9A',
        tailLegs: '#7A7A7A', earInner: '#E8A0B4', eyeIris: '#F5E6AB',
        stripes: '#6B6B6B', showStripes: true,
    },
    // Orange tabby
    {
        body: '#D4874D', bodyLight: '#E8A76E', head: '#DA9560',
        tailLegs: '#C07040', earInner: '#E8A0B4', eyeIris: '#A8D86E',
        stripes: '#B06030', showStripes: true,
    },
    // Black cat
    {
        body: '#3A3A3A', bodyLight: '#505050', head: '#444444',
        tailLegs: '#2A2A2A', earInner: '#C88A9A', eyeIris: '#B8E060',
        stripes: '#2A2A2A', showStripes: false,
    },
    // Cream / white cat
    {
        body: '#E8DDD0', bodyLight: '#F2EDE6', head: '#EDE3D8',
        tailLegs: '#D8CFC2', earInner: '#F0B0C0', eyeIris: '#88BBDD',
        stripes: '#D0C4B4', showStripes: false,
    },
    // Brown tabby
    {
        body: '#7A6048', bodyLight: '#9A7E66', head: '#8A7058',
        tailLegs: '#6A503A', earInner: '#E8A0B4', eyeIris: '#E8D070',
        stripes: '#5A4030', showStripes: true,
    },
];

function getRandomTheme(): CatColors {
    return catThemes[Math.floor(Math.random() * catThemes.length)];
}

function CatSvg({ pose, facingRight, colors }: { pose: CatPose; facingRight: boolean; colors: CatColors }) {
    const transform = facingRight ? '' : 'scale(-1,1) translate(-48,0)';
    const { body, bodyLight, head, tailLegs, earInner, eyeIris, stripes, showStripes } = colors;

    if (pose === 'sleep') {
        return (
            <svg width="48" height="40" viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g transform={transform}>
                    <ellipse cx="24" cy="30" rx="16" ry="9" fill={body} />
                    <path d="M8 28 Q2 24 4 20 Q6 16 10 18" stroke={tailLegs} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <circle cx="34" cy="25" r="7" fill={head} />
                    <path d="M29 19 L31 13 L34 18Z" fill={head} />
                    <path d="M36 18 L39 13 L40 19Z" fill={head} />
                    <path d="M30 19 L31.5 14.5 L33 18.5Z" fill={earInner} />
                    <path d="M36.5 18.5 L38.5 14 L39.5 19Z" fill={earInner} />
                    <path d="M31 24 Q32.5 23 34 24" stroke="#555" strokeWidth="1" strokeLinecap="round" fill="none" />
                    <path d="M36 24 Q37.5 23 39 24" stroke="#555" strokeWidth="1" strokeLinecap="round" fill="none" />
                    <ellipse cx="35" cy="26" rx="1" ry="0.7" fill={earInner} />
                    {showStripes && (
                        <>
                            <path d="M16 24 Q18 22 20 24" stroke={stripes} strokeWidth="1" opacity="0.5" fill="none" />
                            <path d="M20 23 Q22 21 24 23" stroke={stripes} strokeWidth="1" opacity="0.5" fill="none" />
                            <path d="M24 24 Q26 22 28 24" stroke={stripes} strokeWidth="1" opacity="0.5" fill="none" />
                        </>
                    )}
                </g>
            </svg>
        );
    }

    if (pose === 'sit' || pose === 'look') {
        const earTilt = pose === 'look' ? 2 : 0;
        return (
            <svg width="48" height="40" viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g transform={transform}>
                    <path d="M10 32 Q4 28 6 22 Q8 18 12 20" stroke={tailLegs} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <ellipse cx="24" cy="32" rx="11" ry="7" fill={body} />
                    <ellipse cx="28" cy="30" rx="5" ry="4" fill={bodyLight} />
                    <ellipse cx="22" cy="37" rx="3" ry="2" fill={head} />
                    <ellipse cx="28" cy="37" rx="3" ry="2" fill={head} />
                    <circle cx="26" cy="20" r="8" fill={head} />
                    <path d={`M20 13 L${21 - earTilt} 5 L25 12Z`} fill={head} />
                    <path d={`M28 12 L${32 + earTilt} 5 L33 13Z`} fill={head} />
                    <path d={`M21 13 L${21.5 - earTilt} 7 L24 12.5Z`} fill={earInner} />
                    <path d={`M28.5 12.5 L${31.5 + earTilt} 7 L32 13Z`} fill={earInner} />
                    {pose === 'look' ? (
                        <>
                            <ellipse cx="23" cy="19" rx="2" ry="2.2" fill={eyeIris} />
                            <ellipse cx="30" cy="19" rx="2" ry="2.2" fill={eyeIris} />
                            <ellipse cx="23.5" cy="19" rx="1" ry="1.8" fill="#333" />
                            <ellipse cx="30.5" cy="19" rx="1" ry="1.8" fill="#333" />
                        </>
                    ) : (
                        <>
                            <ellipse cx="23" cy="19" rx="1.8" ry="2" fill={eyeIris} />
                            <ellipse cx="30" cy="19" rx="1.8" ry="2" fill={eyeIris} />
                            <ellipse cx="23" cy="19" rx="0.8" ry="1.6" fill="#333" />
                            <ellipse cx="30" cy="19" rx="0.8" ry="1.6" fill="#333" />
                        </>
                    )}
                    <path d="M26 22 L25 23.5 L27 23.5 Z" fill={earInner} />
                    <path d="M25 23.5 Q24 25 23 24.5" stroke="#777" strokeWidth="0.6" fill="none" />
                    <path d="M27 23.5 Q28 25 29 24.5" stroke="#777" strokeWidth="0.6" fill="none" />
                    <line x1="18" y1="21" x2="22" y2="22" stroke="#AAA" strokeWidth="0.5" />
                    <line x1="17" y1="23" x2="22" y2="23" stroke="#AAA" strokeWidth="0.5" />
                    <line x1="31" y1="22" x2="35" y2="21" stroke="#AAA" strokeWidth="0.5" />
                    <line x1="31" y1="23" x2="36" y2="23" stroke="#AAA" strokeWidth="0.5" />
                    {showStripes && (
                        <>
                            <path d="M22 11 Q24 9 26 11" stroke={stripes} strokeWidth="0.8" fill="none" />
                            <path d="M24 10 L24 8" stroke={stripes} strokeWidth="0.8" />
                        </>
                    )}
                </g>
            </svg>
        );
    }

    // Walking poses
    const isStep1 = pose === 'walk1';
    return (
        <svg width="48" height="40" viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform={transform}>
                <path d={isStep1 ? 'M6 20 Q0 14 2 8 Q4 4 8 6' : 'M6 20 Q-1 16 3 10 Q6 6 9 8'} stroke={tailLegs} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <ellipse cx="22" cy="24" rx="14" ry="7" fill={body} />
                <ellipse cx="22" cy="26" rx="10" ry="4" fill={bodyLight} />
                <line x1={isStep1 ? '11' : '13'} y1="29" x2={isStep1 ? '9' : '14'} y2="37" stroke={tailLegs} strokeWidth="3" strokeLinecap="round" />
                <line x1={isStep1 ? '16' : '10'} y1="29" x2={isStep1 ? '17' : '8'} y2="37" stroke={tailLegs} strokeWidth="3" strokeLinecap="round" />
                <line x1={isStep1 ? '30' : '28'} y1="28" x2={isStep1 ? '28' : '29'} y2="37" stroke={body} strokeWidth="3" strokeLinecap="round" />
                <line x1={isStep1 ? '33' : '34'} y1="28" x2={isStep1 ? '35' : '33'} y2="37" stroke={body} strokeWidth="3" strokeLinecap="round" />
                <ellipse cx={isStep1 ? 9 : 14} cy="37.5" rx="2" ry="1" fill={head} />
                <ellipse cx={isStep1 ? 17 : 8} cy="37.5" rx="2" ry="1" fill={head} />
                <ellipse cx={isStep1 ? 28 : 29} cy="37.5" rx="2" ry="1" fill={head} />
                <ellipse cx={isStep1 ? 35 : 33} cy="37.5" rx="2" ry="1" fill={head} />
                <circle cx="36" cy="18" r="8" fill={head} />
                <path d="M30 11 L31 3 L35 10Z" fill={head} />
                <path d="M37 10 L41 3 L42 11Z" fill={head} />
                <path d="M31 11 L31.7 5 L34 10.5Z" fill={earInner} />
                <path d="M37.5 10.5 L40.5 5 L41 11Z" fill={earInner} />
                <ellipse cx="33" cy="17" rx="1.5" ry="1.8" fill={eyeIris} />
                <ellipse cx="39" cy="17" rx="1.5" ry="1.8" fill={eyeIris} />
                <ellipse cx="33.3" cy="17" rx="0.7" ry="1.4" fill="#333" />
                <ellipse cx="39.3" cy="17" rx="0.7" ry="1.4" fill="#333" />
                <path d="M36 20 L35 21.5 L37 21.5 Z" fill={earInner} />
                <path d="M35 21.5 Q34 23 33 22" stroke="#777" strokeWidth="0.5" fill="none" />
                <path d="M37 21.5 Q38 23 39 22" stroke="#777" strokeWidth="0.5" fill="none" />
                <line x1="28" y1="19" x2="32" y2="20" stroke="#AAA" strokeWidth="0.5" />
                <line x1="27" y1="21" x2="32" y2="21" stroke="#AAA" strokeWidth="0.5" />
                <line x1="41" y1="20" x2="45" y2="19" stroke="#AAA" strokeWidth="0.5" />
                <line x1="41" y1="21" x2="46" y2="21" stroke="#AAA" strokeWidth="0.5" />
                {showStripes && (
                    <>
                        <path d="M33 9 Q35 7 37 9" stroke={stripes} strokeWidth="0.8" fill="none" />
                        <path d="M35 8 L35 6" stroke={stripes} strokeWidth="0.8" />
                        <path d="M17 19 L15 25" stroke={stripes} strokeWidth="0.8" opacity="0.4" />
                        <path d="M21 18 L19 24" stroke={stripes} strokeWidth="0.8" opacity="0.4" />
                        <path d="M25 18 L23 24" stroke={stripes} strokeWidth="0.8" opacity="0.4" />
                    </>
                )}
            </g>
        </svg>
    );
}

function SpeechBubble({ message }: { message: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.8 }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/90 backdrop-blur-sm text-xs text-gray-600 px-2.5 py-1 rounded-full shadow-sm border border-pink-100"
        >
            {message}
        </motion.div>
    );
}

// Keyframes for walking: move -> pause -> move -> pause (realistic gait)
function buildWalkKeyframes(direction: 'left' | 'right', screenW: number) {
    const start = direction === 'right' ? -60 : screenW + 60;
    const end = direction === 'right' ? screenW + 60 : -60;
    const range = end - start;

    return {
        x: [
            start,
            start + range * 0.25,
            start + range * 0.25, // pause
            start + range * 0.55,
            start + range * 0.55, // pause
            end,
        ],
        transition: {
            duration: 14,
            times: [0, 0.22, 0.3, 0.55, 0.62, 1],
            ease: 'linear' as const,
        },
    };
}

const MIN_INTERVAL_MS = 3 * 60 * 1000;
const MAX_INTERVAL_MS = 8 * 60 * 1000;

function getRandomInterval() {
    return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
}

type CatBehavior =
    | { type: 'walkAcross'; direction: 'left' | 'right' }
    | { type: 'sitAndChat' }
    | { type: 'peekFromEdge'; side: 'left' | 'right' }
    | { type: 'napInCorner' };

function getRandomBehavior(): CatBehavior {
    const roll = Math.random();
    if (roll < 0.30) return { type: 'walkAcross', direction: Math.random() > 0.5 ? 'left' : 'right' };
    if (roll < 0.60) return { type: 'sitAndChat' };
    if (roll < 0.82) return { type: 'peekFromEdge', side: Math.random() > 0.5 ? 'left' : 'right' };
    return { type: 'napInCorner' };
}

function WalkingCat({ direction, message, showMessage, colors }: { direction: 'left' | 'right'; message: string; showMessage: boolean; colors: CatColors }) {
    const [pose, setPose] = useState<CatPose>('walk1');
    const [paused, setPaused] = useState(false);
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const walkAnim = buildWalkKeyframes(direction, screenW);

    useEffect(() => {
        const interval = setInterval(() => {
            setPose(prev => prev === 'walk1' ? 'walk2' : 'walk1');
        }, 280);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const dur = walkAnim.transition.duration * 1000;
        const timers = [
            setTimeout(() => setPaused(true), dur * 0.22),
            setTimeout(() => setPaused(false), dur * 0.30),
            setTimeout(() => setPaused(true), dur * 0.55),
            setTimeout(() => setPaused(false), dur * 0.62),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    const currentPose = paused ? 'look' : pose;

    return (
        <motion.div
            className="fixed bottom-1 z-50 pointer-events-none select-none"
            initial={{ x: walkAnim.x[0] }}
            animate={{ x: walkAnim.x }}
            exit={{ opacity: 0 }}
            transition={walkAnim.transition}
        >
            <div className="relative">
                <AnimatePresence>
                    {showMessage && <SpeechBubble message={message} />}
                </AnimatePresence>
                <motion.div
                    animate={paused ? { y: [0, -2, 0] } : {}}
                    transition={paused ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } : {}}
                >
                    <CatSvg pose={currentPose} facingRight={direction === 'right'} colors={colors} />
                </motion.div>
            </div>
        </motion.div>
    );
}

export default function MotivationCat() {
    const [visible, setVisible] = useState(false);
    const [behavior, setBehavior] = useState<CatBehavior | null>(null);
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [catColors, setCatColors] = useState<CatColors>(getRandomTheme);
    const posRef = useRef(`${30 + Math.random() * 40}%`);

    const triggerCat = useCallback(() => {
        const b = getRandomBehavior();
        setBehavior(b);
        setMessage(getRandomMessage());
        setCatColors(getRandomTheme());
        setVisible(true);
        setShowMessage(false);
        posRef.current = `${30 + Math.random() * 40}%`;

        if (b.type === 'sitAndChat' || b.type === 'peekFromEdge') {
            setTimeout(() => setShowMessage(true), 800);
        }
        if (b.type === 'walkAcross') {
            setTimeout(() => setShowMessage(true), 3200);
        }

        const duration = b.type === 'napInCorner' ? 12000 : b.type === 'walkAcross' ? 14500 : 6000;
        setTimeout(() => {
            setShowMessage(false);
            setTimeout(() => setVisible(false), 600);
        }, duration);
    }, []);

    useEffect(() => {
        const initialDelay = setTimeout(() => triggerCat(), 30000);
        return () => clearTimeout(initialDelay);
    }, [triggerCat]);

    useEffect(() => {
        if (visible) return;
        const timer = setTimeout(() => triggerCat(), getRandomInterval());
        return () => clearTimeout(timer);
    }, [visible, triggerCat]);

    return (
        <AnimatePresence>
            {visible && behavior && (
                <>
                    {behavior.type === 'walkAcross' && (
                        <WalkingCat
                            direction={behavior.direction}
                            message={message}
                            showMessage={showMessage}
                            colors={catColors}
                        />
                    )}

                    {behavior.type === 'sitAndChat' && (
                        <motion.div
                            className="fixed bottom-1 z-50 pointer-events-none select-none"
                            style={{ left: posRef.current }}
                            initial={{ y: 50 }}
                            animate={{ y: 0 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ type: 'spring', bounce: 0.3 }}
                        >
                            <div className="relative">
                                <AnimatePresence>
                                    {showMessage && <SpeechBubble message={message} />}
                                </AnimatePresence>
                                <motion.div
                                    animate={{ y: [0, -1.5, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                >
                                    <CatSvg pose="sit" facingRight colors={catColors} />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {behavior.type === 'peekFromEdge' && (
                        <motion.div
                            className="fixed bottom-16 z-50 pointer-events-none select-none"
                            style={{ [behavior.side]: 0 }}
                            initial={{ x: behavior.side === 'left' ? -40 : 40 }}
                            animate={{ x: behavior.side === 'left' ? 6 : -6 }}
                            exit={{ x: behavior.side === 'left' ? -40 : 40 }}
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
                        >
                            <div className="relative">
                                <AnimatePresence>
                                    {showMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className={`absolute -top-9 whitespace-nowrap bg-white/90 backdrop-blur-sm text-xs text-gray-600 px-2.5 py-1 rounded-full shadow-sm border border-pink-100 ${
                                                behavior.side === 'left' ? 'left-4' : 'right-4'
                                            }`}
                                        >
                                            {message}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <CatSvg pose="look" facingRight={behavior.side === 'left'} colors={catColors} />
                            </div>
                        </motion.div>
                    )}

                    {behavior.type === 'napInCorner' && (
                        <motion.div
                            className="fixed bottom-1 right-6 z-50 pointer-events-none select-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                        >
                            <div className="relative">
                                <motion.span
                                    className="absolute -top-5 right-0 text-gray-400 text-[10px] font-medium select-none"
                                    animate={{ opacity: [0, 1, 0], y: [0, -6, -12], scale: [0.8, 1.1, 0.8] }}
                                    transition={{ repeat: Infinity, duration: 2.5 }}
                                >
                                    zzz
                                </motion.span>
                                <motion.div
                                    animate={{ y: [0, -0.5, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                >
                                    <CatSvg pose="sleep" facingRight colors={catColors} />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </AnimatePresence>
    );
}
