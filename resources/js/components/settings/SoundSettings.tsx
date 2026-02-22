import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, VolumeX, Play } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { SOUND_LIBRARY } from '@/lib/chime';
import type { SoundId } from '@/types';
import SettingsSection from './SettingsSection';

interface SoundSettingsProps {
    enabled: boolean;
    volume: number;
    soundPomodoroEnd: SoundId;
    soundBreakEnd: SoundId;
    soundTaskComplete: SoundId;
    onChange: (key: string, value: boolean | number | string) => void;
}

const EVENT_ROWS: { key: string; label: string }[] = [
    { key: 'sound_pomodoro_end', label: 'Pomodoro beendet' },
    { key: 'sound_break_end', label: 'Pause beendet' },
    { key: 'sound_task_complete', label: 'Aufgabe erledigt' },
];

export default function SoundSettings({
    enabled,
    volume,
    soundPomodoroEnd,
    soundBreakEnd,
    soundTaskComplete,
    onChange,
}: SoundSettingsProps) {
    const { previewSound } = useSound();

    const valueMap: Record<string, SoundId> = {
        sound_pomodoro_end: soundPomodoroEnd,
        sound_break_end: soundBreakEnd,
        sound_task_complete: soundTaskComplete,
    };

    return (
        <SettingsSection
            title="Sound-Einstellungen"
            description="Konfiguriere die Benachrichtigungs-Sounds."
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {enabled ? (
                            <Volume2 className="w-5 h-5 text-pink-500" />
                        ) : (
                            <VolumeX className="w-5 h-5 text-gray-400" />
                        )}
                        <Label>Sounds aktiviert</Label>
                    </div>
                    <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => onChange('sound_enabled', checked)}
                        className="data-[state=checked]:bg-pink-400"
                    />
                </div>
                {enabled && (
                    <>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Lautstärke</Label>
                                <span className="text-sm font-semibold text-gray-600">{volume}%</span>
                            </div>
                            <Slider
                                value={[volume]}
                                onValueChange={([v]) => onChange('sound_volume', v)}
                                min={0}
                                max={100}
                                step={5}
                                className="[&_[role=slider]]:bg-pink-400 [&_[role=slider]]:border-pink-400"
                            />
                        </div>

                        <div className="space-y-4 pt-2">
                            {EVENT_ROWS.map(({ key, label }) => (
                                <div key={key} className="flex items-center gap-3">
                                    <Label className="w-36 shrink-0 text-sm">{label}</Label>
                                    <Select
                                        value={valueMap[key]}
                                        onValueChange={(v) => onChange(key, v)}
                                    >
                                        <SelectTrigger className="flex-1 rounded-xl border-pink-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SOUND_LIBRARY.map((sound) => (
                                                <SelectItem key={sound.id} value={sound.id}>
                                                    {sound.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0 rounded-xl border-pink-200 hover:bg-pink-50"
                                        onClick={() => previewSound(valueMap[key])}
                                    >
                                        <Play className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </SettingsSection>
    );
}
