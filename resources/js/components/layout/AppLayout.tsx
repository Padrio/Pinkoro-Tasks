import { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import Navigation from './Navigation';
import MotivationCat from './MotivationCat';
import { TimerProvider } from '@/contexts/TimerContext';
import { SoundProvider } from '@/contexts/SoundContext';
import { Toaster } from '@/components/ui/toaster';
import type { Settings } from '@/types';

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { settings } = usePage<{ settings: Settings }>().props;

    return (
        <SoundProvider
            initialEnabled={settings.sound_enabled}
            initialVolume={settings.sound_volume}
            initialPomodoroEnd={settings.sound_pomodoro_end}
            initialBreakEnd={settings.sound_break_end}
            initialTaskComplete={settings.sound_task_complete}
        >
            <TimerProvider>
                <div className="gradient-bg min-h-screen">
                    <Navigation />
                    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </main>
                    <Toaster />
                    <MotivationCat />
                </div>
            </TimerProvider>
        </SoundProvider>
    );
}
