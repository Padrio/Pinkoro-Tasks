import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import TimerSettings from '@/components/settings/TimerSettings';
import SoundSettings from '@/components/settings/SoundSettings';
import type { Settings as SettingsType } from '@/types';

interface SettingsProps {
    settings: SettingsType;
    defaults: SettingsType;
}

export default function Settings({ settings, defaults }: SettingsProps) {
    const [values, setValues] = useState(settings);
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = useCallback((key: string, value: number | boolean) => {
        setValues((prev) => ({ ...prev, [key]: value }));
        setIsDirty(true);
    }, []);

    const handleSave = () => {
        router.patch(route('settings.update'), values as any, {
            preserveState: true,
            onSuccess: () => setIsDirty(false),
        });
    };

    const handleReset = () => {
        setValues(defaults);
        setIsDirty(true);
    };

    return (
        <>
            <Head title="Einstellungen" />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 max-w-2xl"
            >
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Einstellungen</h1>
                    {isDirty && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Button
                                onClick={handleSave}
                                className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl shadow-lg shadow-pink-200/50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Speichern
                            </Button>
                        </motion.div>
                    )}
                </div>

                <TimerSettings
                    pomodoroMinutes={values.pomodoro_duration}
                    shortBreakMinutes={values.short_break_duration}
                    longBreakMinutes={values.long_break_duration}
                    onChange={handleChange}
                />

                <SoundSettings
                    enabled={values.sound_enabled}
                    volume={values.sound_volume}
                    onChange={handleChange}
                />

                <div className="glass p-6">
                    <Button
                        onClick={handleReset}
                        variant="outline"
                        className="rounded-xl border-pink-200 hover:bg-pink-50"
                    >
                        Auf Standardwerte zurücksetzen
                    </Button>
                </div>
            </motion.div>
        </>
    );
}
