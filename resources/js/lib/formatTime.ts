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

export function getDeadlineStatus(deadline: string): 'overdue' | 'today' | 'soon' | 'normal' {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = deadline.split('T')[0];
    const deadlineDate = new Date(dateOnly + 'T00:00:00');

    const diffMs = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 3) return 'soon';
    return 'normal';
}

export function formatDeadline(deadline: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = deadline.split('T')[0];
    const deadlineDate = new Date(dateOnly + 'T00:00:00');

    const diffMs = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < -1) return `${Math.abs(diffDays)} Tage überfällig`;
    if (diffDays === -1) return '1 Tag überfällig';
    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Morgen';
    if (diffDays <= 7) return `in ${diffDays} Tagen`;

    return deadlineDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
