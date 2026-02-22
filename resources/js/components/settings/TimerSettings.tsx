import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import SettingsSection from './SettingsSection';
import type { TimerDisplayMode } from '@/types';
import { Circle, BarChart3, Droplets, Hash, Eye } from 'lucide-react';

interface TimerSettingsProps {
    pomodoroMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    pomodorosPerSet: number;
    timerDisplayMode: TimerDisplayMode;
    onChange: (key: string, value: number | boolean | string) => void;
}

const displayModes: { value: TimerDisplayMode; label: string; description: string; icon: typeof Circle }[] = [
    { value: 'ring_time', label: 'Ring + Zeit', description: 'Klassisch mit Countdown', icon: Circle },
    { value: 'ring_percent', label: 'Ring + %', description: 'Ring mit Prozentanzeige', icon: Hash },
    { value: 'ring_only', label: 'Nur Ring', description: 'Minimalistisch', icon: Eye },
    { value: 'bar', label: 'Balken', description: 'Horizontaler Fortschritt', icon: BarChart3 },
    { value: 'liquid', label: 'Liquid', description: 'Kreative Wellen-Animation', icon: Droplets },
];

export default function TimerSettings({
    pomodoroMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    pomodorosPerSet,
    timerDisplayMode,
    onChange,
}: TimerSettingsProps) {
    return (
        <>
            <SettingsSection
                title="Timer-Einstellungen"
                description="Passe die Dauer deiner Pomodoros und Pausen an."
            >
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Pomodoro-Dauer</Label>
                            <span className="text-sm font-mono-timer font-semibold text-pink-600">
                                {pomodoroMinutes} Min
                            </span>
                        </div>
                        <Slider
                            value={[pomodoroMinutes]}
                            onValueChange={([v]) => onChange('pomodoro_duration', v)}
                            min={5}
                            max={90}
                            step={5}
                            className="[&_[role=slider]]:bg-pink-400 [&_[role=slider]]:border-pink-400"
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Kurze Pause</Label>
                            <span className="text-sm font-mono-timer font-semibold text-green-600">
                                {shortBreakMinutes} Min
                            </span>
                        </div>
                        <Slider
                            value={[shortBreakMinutes]}
                            onValueChange={([v]) => onChange('short_break_duration', v)}
                            min={1}
                            max={30}
                            step={1}
                            className="[&_[role=slider]]:bg-green-400 [&_[role=slider]]:border-green-400"
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Lange Pause</Label>
                            <span className="text-sm font-mono-timer font-semibold text-blue-600">
                                {longBreakMinutes} Min
                            </span>
                        </div>
                        <Slider
                            value={[longBreakMinutes]}
                            onValueChange={([v]) => onChange('long_break_duration', v)}
                            min={5}
                            max={60}
                            step={5}
                            className="[&_[role=slider]]:bg-blue-400 [&_[role=slider]]:border-blue-400"
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Pomodoros pro Set</Label>
                            <span className="text-sm font-mono-timer font-semibold text-orange-600">
                                {pomodorosPerSet}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">
                            Nach {pomodorosPerSet} Pomodoros kommt automatisch eine lange Pause.
                        </p>
                        <Slider
                            value={[pomodorosPerSet]}
                            onValueChange={([v]) => onChange('pomodoros_per_set', v)}
                            min={2}
                            max={6}
                            step={1}
                            className="[&_[role=slider]]:bg-orange-400 [&_[role=slider]]:border-orange-400"
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection
                title="Timer-Anzeige"
                description="Wähle, wie der Timer während eines Pomodoros dargestellt wird."
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {displayModes.map((mode) => {
                        const Icon = mode.icon;
                        const isActive = timerDisplayMode === mode.value;
                        return (
                            <button
                                key={mode.value}
                                onClick={() => onChange('timer_display_mode', mode.value)}
                                className={`p-3 rounded-xl border-2 transition-all text-left ${
                                    isActive
                                        ? 'border-pink-400 bg-pink-50/50 shadow-sm'
                                        : 'border-transparent bg-white/30 hover:bg-white/50'
                                }`}
                            >
                                <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-pink-500' : 'text-gray-400'}`} />
                                <p className={`text-sm font-semibold ${isActive ? 'text-pink-700' : 'text-gray-700'}`}>
                                    {mode.label}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">{mode.description}</p>
                            </button>
                        );
                    })}
                </div>
            </SettingsSection>
        </>
    );
}
