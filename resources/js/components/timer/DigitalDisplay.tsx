import { formatTime } from '@/lib/formatTime';

interface DigitalDisplayProps {
    seconds: number;
    className?: string;
}

export default function DigitalDisplay({ seconds, className = '' }: DigitalDisplayProps) {
    return (
        <div className={`font-mono-timer text-5xl font-bold tabular-nums text-gray-800 ${className}`}>
            {formatTime(seconds)}
        </div>
    );
}
