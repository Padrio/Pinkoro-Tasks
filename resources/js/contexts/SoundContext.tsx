import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { playSoundById, playTick, playButtonClick } from '@/lib/chime';
import type { SoundId } from '@/types';

export type SoundEvent = 'pomodoro-end' | 'break-end' | 'task-complete' | 'tick' | 'button-click';

interface SoundContextType {
    playSound: (event: SoundEvent) => void;
    previewSound: (id: SoundId) => void;
    soundEnabled: boolean;
    soundVolume: number;
    soundPomodoroEnd: SoundId;
    soundBreakEnd: SoundId;
    soundTaskComplete: SoundId;
    setSoundEnabled: (enabled: boolean) => void;
    setSoundVolume: (volume: number) => void;
    setSoundPomodoroEnd: (id: SoundId) => void;
    setSoundBreakEnd: (id: SoundId) => void;
    setSoundTaskComplete: (id: SoundId) => void;
}

const SoundContext = createContext<SoundContextType>({
    playSound: () => {},
    previewSound: () => {},
    soundEnabled: true,
    soundVolume: 80,
    soundPomodoroEnd: 'glockenspiel',
    soundBreakEnd: 'abschluss',
    soundTaskComplete: 'doppelton',
    setSoundEnabled: () => {},
    setSoundVolume: () => {},
    setSoundPomodoroEnd: () => {},
    setSoundBreakEnd: () => {},
    setSoundTaskComplete: () => {},
});

export function SoundProvider({
    children,
    initialEnabled = true,
    initialVolume = 80,
    initialPomodoroEnd = 'glockenspiel' as SoundId,
    initialBreakEnd = 'abschluss' as SoundId,
    initialTaskComplete = 'doppelton' as SoundId,
}: {
    children: React.ReactNode;
    initialEnabled?: boolean;
    initialVolume?: number;
    initialPomodoroEnd?: SoundId;
    initialBreakEnd?: SoundId;
    initialTaskComplete?: SoundId;
}) {
    const [soundEnabled, setSoundEnabled] = useState(initialEnabled);
    const [soundVolume, setSoundVolume] = useState(initialVolume);
    const [soundPomodoroEnd, setSoundPomodoroEnd] = useState<SoundId>(initialPomodoroEnd);
    const [soundBreakEnd, setSoundBreakEnd] = useState<SoundId>(initialBreakEnd);
    const [soundTaskComplete, setSoundTaskComplete] = useState<SoundId>(initialTaskComplete);

    // Sync with props when Inertia updates shared settings
    useEffect(() => { setSoundEnabled(initialEnabled); }, [initialEnabled]);
    useEffect(() => { setSoundVolume(initialVolume); }, [initialVolume]);
    useEffect(() => { setSoundPomodoroEnd(initialPomodoroEnd); }, [initialPomodoroEnd]);
    useEffect(() => { setSoundBreakEnd(initialBreakEnd); }, [initialBreakEnd]);
    useEffect(() => { setSoundTaskComplete(initialTaskComplete); }, [initialTaskComplete]);

    const playSound = useCallback(
        (event: SoundEvent) => {
            if (!soundEnabled) return;

            switch (event) {
                case 'pomodoro-end':
                    playSoundById(soundPomodoroEnd, soundVolume);
                    break;
                case 'break-end':
                    playSoundById(soundBreakEnd, soundVolume);
                    break;
                case 'task-complete':
                    playSoundById(soundTaskComplete, soundVolume);
                    break;
                case 'tick':
                    playTick(soundVolume);
                    break;
                case 'button-click':
                    playButtonClick(soundVolume);
                    break;
            }
        },
        [soundEnabled, soundVolume, soundPomodoroEnd, soundBreakEnd, soundTaskComplete],
    );

    const previewSound = useCallback(
        (id: SoundId) => {
            playSoundById(id, soundVolume);
        },
        [soundVolume],
    );

    return (
        <SoundContext.Provider
            value={{
                playSound,
                previewSound,
                soundEnabled,
                soundVolume,
                soundPomodoroEnd,
                soundBreakEnd,
                soundTaskComplete,
                setSoundEnabled,
                setSoundVolume,
                setSoundPomodoroEnd,
                setSoundBreakEnd,
                setSoundTaskComplete,
            }}
        >
            {children}
        </SoundContext.Provider>
    );
}

export const useSound = () => useContext(SoundContext);
