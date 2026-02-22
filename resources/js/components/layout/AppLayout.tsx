import { ReactNode } from 'react';
import Navigation from './Navigation';
import { TimerProvider } from '@/contexts/TimerContext';
import { SoundProvider } from '@/contexts/SoundContext';
import { Toaster } from '@/components/ui/toaster';

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <SoundProvider>
            <TimerProvider>
                <div className="gradient-bg min-h-screen">
                    <Navigation />
                    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </main>
                    <Toaster />
                </div>
            </TimerProvider>
        </SoundProvider>
    );
}
