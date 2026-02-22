interface PercentageDisplayProps {
    progress: number; // 0 to 1
    className?: string;
}

export default function PercentageDisplay({ progress, className = '' }: PercentageDisplayProps) {
    const percent = Math.round(progress * 100);

    return (
        <div className={`font-mono-timer text-5xl font-bold tabular-nums text-gray-800 ${className}`}>
            {percent}%
        </div>
    );
}
