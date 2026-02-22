import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyStats } from '@/types';

interface PomodoroChartProps {
    data: DailyStats[];
}

export default function PomodoroChart({ data }: PomodoroChartProps) {
    const formatted = data.map((d) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
    }));

    return (
        <div className="glass p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Fokuszeit (Minuten)</h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatted}>
                        <defs>
                            <linearGradient id="pomodoroGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C4B5FD" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.5)',
                                borderRadius: '12px',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="pomodoro_minutes"
                            name="Minuten"
                            stroke="#C4B5FD"
                            fill="url(#pomodoroGradient)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
