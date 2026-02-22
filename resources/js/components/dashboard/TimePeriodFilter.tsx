import { router } from '@inertiajs/react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimePeriodFilterProps {
    current: string;
}

const periods = [
    { value: 'today', label: 'Heute' },
    { value: '7days', label: '7 Tage' },
    { value: '30days', label: '30 Tage' },
    { value: 'all', label: 'Gesamt' },
];

export default function TimePeriodFilter({ current }: TimePeriodFilterProps) {
    return (
        <Tabs
            value={current}
            onValueChange={(value) => {
                router.get('/', { period: value }, { preserveState: true, preserveScroll: true });
            }}
        >
            <TabsList className="bg-white/30 backdrop-blur-sm border border-white/40">
                {periods.map((period) => (
                    <TabsTrigger
                        key={period.value}
                        value={period.value}
                        className="data-[state=active]:bg-white/60 data-[state=active]:text-pink-700 rounded-lg"
                    >
                        {period.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
