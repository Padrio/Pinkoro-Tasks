import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import SettingsSection from './SettingsSection';

interface TimerSettingsProps {
    pomodoroMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    onChange: (key: string, value: number) => void;
}

export default function TimerSettings({
    pomodoroMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    onChange,
}: TimerSettingsProps) {
    return (
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
            </div>
        </SettingsSection>
    );
}
