let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

function playChime(frequency: number, duration: number, volume: number, startTime?: number): void {
    const ctx = getAudioContext();
    const now = startTime ?? ctx.currentTime;

    // Fundamental oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frequency;

    // Harmonic overtone for warmth
    const overtone = ctx.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.value = frequency * 2;

    // Gain envelope (ADSR-like)
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(volume * 0.6, now + duration * 0.3); // Decay
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Release

    // Overtone gain (quieter than fundamental)
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0, now);
    overtoneGain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.01);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);

    osc.connect(gain);
    overtone.connect(overtoneGain);
    gain.connect(ctx.destination);
    overtoneGain.connect(ctx.destination);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + duration);
    overtone.stop(now + duration);
}

// --- Sound Library ---

export type SoundId =
    | 'glockenspiel'
    | 'sanfter_dreiklang'
    | 'aufstieg'
    | 'glocke'
    | 'doppelton'
    | 'abschluss'
    | 'harfe'
    | 'tropfen'
    | 'keine';

export interface SoundDefinition {
    id: SoundId;
    label: string;
    play: (volume: number) => void;
}

function playGlockenspiel(volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = volume / 100;
    // Aufsteigender C-Dur Dreiklang (C5 → E5 → G5)
    playChime(523.25, 0.4, vol * 0.5, now);
    playChime(659.25, 0.4, vol * 0.6, now + 0.3);
    playChime(783.99, 0.6, vol * 0.7, now + 0.6);
}

function playSanfterDreiklang(volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = volume / 100;
    // Warmer G-Dur Akkord (G4 → B4 → D5) gleichzeitig
    playChime(392.0, 0.8, vol * 0.4, now);
    playChime(493.88, 0.8, vol * 0.4, now + 0.05);
    playChime(587.33, 0.8, vol * 0.5, now + 0.1);
}

function playAufstieg(volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = volume / 100;
    // 4-Ton Arpeggio (C4 → E4 → G4 → C5)
    playChime(261.63, 0.35, vol * 0.4, now);
    playChime(329.63, 0.35, vol * 0.45, now + 0.2);
    playChime(392.0, 0.35, vol * 0.5, now + 0.4);
    playChime(523.25, 0.5, vol * 0.6, now + 0.6);
}

function playGlocke(volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = volume / 100;

    // Main bell tone (A4) with triangle wave
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.value = 440;

    // Shimmer beat frequency (slightly detuned)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 442;

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(vol * 0.5, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(vol * 0.3, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(ctx.destination);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.5);
    osc2.stop(now + 1.2);
}

function playDoppelton(volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = volume / 100;
    // Zweifaches Ding-Ding (E5, E5)
    playChime(659.25, 0.25, vol * 0.5, now);
    playChime(659.25, 0.3, vol * 0.6, now + 0.3);
}

function playAbschluss(volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = volume / 100;
    // Absteigender Dreiklang (G5 → E5 → C5)
    playChime(783.99, 0.4, vol * 0.6, now);
    playChime(659.25, 0.4, vol * 0.55, now + 0.3);
    playChime(523.25, 0.6, vol * 0.5, now + 0.6);
}

function playHarfe(volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = volume / 100;
    // Schnelles Harfen-Arpeggio (C5 → E5 → G5 → C6)
    playChime(523.25, 0.5, vol * 0.4, now);
    playChime(659.25, 0.5, vol * 0.45, now + 0.1);
    playChime(783.99, 0.5, vol * 0.5, now + 0.2);
    playChime(1046.5, 0.6, vol * 0.55, now + 0.3);
}

function playTropfen(volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = volume / 100;

    // Fallender Wassertropfen (B5 → G5 pitch-drop)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // → G5

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol * 0.5, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
}

function playKeine(_volume: number): void {
    // Silence
}

export const SOUND_LIBRARY: SoundDefinition[] = [
    { id: 'glockenspiel', label: 'Glockenspiel', play: playGlockenspiel },
    { id: 'sanfter_dreiklang', label: 'Sanfter Dreiklang', play: playSanfterDreiklang },
    { id: 'aufstieg', label: 'Aufstieg', play: playAufstieg },
    { id: 'glocke', label: 'Glocke', play: playGlocke },
    { id: 'doppelton', label: 'Doppelton', play: playDoppelton },
    { id: 'abschluss', label: 'Abschluss', play: playAbschluss },
    { id: 'harfe', label: 'Harfe', play: playHarfe },
    { id: 'tropfen', label: 'Tropfen', play: playTropfen },
    { id: 'keine', label: 'Kein Sound', play: playKeine },
];

const soundMap = new Map(SOUND_LIBRARY.map((s) => [s.id, s.play]));

export function playSoundById(id: SoundId, volume: number): void {
    const fn = soundMap.get(id);
    if (fn) fn(volume);
}

// Fixed sounds (not configurable per event)
export function playTick(volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = volume / 100;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
}

export function playCountdownBeep(volume: number, isLast: boolean = false): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = volume / 100;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    // Higher pitch for the final beep
    osc.frequency.value = isLast ? 880 : 660;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol * 0.25, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isLast ? 0.3 : 0.15));

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (isLast ? 0.3 : 0.15));
}

export function playButtonClick(volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const vol = volume / 100;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1200;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
}
