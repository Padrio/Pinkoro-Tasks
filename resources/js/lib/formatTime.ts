export function formatTime(totalSeconds: number): string {
    if (totalSeconds < 0 || !Number.isFinite(totalSeconds)) {
        return '00:00';
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatMinutes(minutes: number): string {
    if (minutes < 60) return `${minutes} Min`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}
