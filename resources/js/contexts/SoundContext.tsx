import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';

interface SoundContextType {
    playSound: (sound: 'timer-complete' | 'task-complete' | 'tick' | 'button-click') => void;
    soundEnabled: boolean;
    soundVolume: number;
    setSoundEnabled: (enabled: boolean) => void;
    setSoundVolume: (volume: number) => void;
}

const SoundContext = createContext<SoundContextType>({
    playSound: () => {},
    soundEnabled: true,
    soundVolume: 80,
    setSoundEnabled: () => {},
    setSoundVolume: () => {},
});

export function SoundProvider({
    children,
    initialEnabled = true,
    initialVolume = 80,
}: {
    children: React.ReactNode;
    initialEnabled?: boolean;
    initialVolume?: number;
}) {
    const [soundEnabled, setSoundEnabled] = React.useState(initialEnabled);
    const [soundVolume, setSoundVolume] = React.useState(initialVolume);
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    useEffect(() => {
        const sounds = ['timer-complete', 'task-complete', 'tick', 'button-click'];
        sounds.forEach((name) => {
            const audio = new Audio(`/sounds/${name}.mp3`);
            audio.preload = 'auto';
            audioRefs.current[name] = audio;
        });
    }, []);

    const playSound = useCallback(
        (sound: 'timer-complete' | 'task-complete' | 'tick' | 'button-click') => {
            if (!soundEnabled) return;
            const audio = audioRefs.current[sound];
            if (audio) {
                audio.volume = soundVolume / 100;
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        },
        [soundEnabled, soundVolume],
    );

    return (
        <SoundContext.Provider
            value={{ playSound, soundEnabled, soundVolume, setSoundEnabled, setSoundVolume }}
        >
            {children}
        </SoundContext.Provider>
    );
}

export const useSound = () => useContext(SoundContext);
