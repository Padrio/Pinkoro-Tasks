import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import SettingsSection from './SettingsSection';

interface SoundSettingsProps {
    enabled: boolean;
    volume: number;
    onChange: (key: string, value: boolean | number) => void;
}

export default function SoundSettings({ enabled, volume, onChange }: SoundSettingsProps) {
    const { playSound } = useSound();

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
                        <Button
                            onClick={() => playSound('timer-complete')}
                            variant="outline"
                            className="rounded-xl border-pink-200 hover:bg-pink-50"
                        >
                            <Volume2 className="w-4 h-4 mr-2" />
                            Test-Sound abspielen
                        </Button>
                    </>
                )}
            </div>
        </SettingsSection>
    );
}
