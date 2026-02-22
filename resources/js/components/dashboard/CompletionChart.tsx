import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyStats } from '@/types';

interface CompletionChartProps {
    data: DailyStats[];
}

export default function CompletionChart({ data }: CompletionChartProps) {
    const formatted = data.map((d) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
    }));

    return (
        <div className="glass p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Erledigte Tasks</h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <BarChart data={formatted}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.5)',
                                borderRadius: '12px',
                            }}
                        />
                        <Bar
                            dataKey="tasks_completed"
                            name="Tasks"
                            fill="#F9A8D4"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
