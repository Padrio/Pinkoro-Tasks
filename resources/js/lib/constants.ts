export const TIMER_PRESETS = [
    { label: '25 Min', value: 25, type: 'pomodoro' as const },
    { label: '5 Min', value: 5, type: 'short_break' as const },
    { label: '15 Min', value: 15, type: 'long_break' as const },
];

export const BREAK_PRESETS = [
    { label: 'Kurze Pause (5 Min)', value: 5, type: 'short_break' as const },
    { label: 'Lange Pause (15 Min)', value: 15, type: 'long_break' as const },
];
