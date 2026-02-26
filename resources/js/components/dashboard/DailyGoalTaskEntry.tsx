import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TaskEntryData {
    task_id: number;
    title: string;
    time_slot_start: string;
    time_slot_end: string;
}

interface DailyGoalTaskEntryProps {
    entry: TaskEntryData;
    onRemove: () => void;
    onUpdate: (field: 'time_slot_start' | 'time_slot_end', value: string) => void;
}

export default function DailyGoalTaskEntry({ entry, onRemove, onUpdate }: DailyGoalTaskEntryProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: entry.task_id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 p-2 rounded-lg border border-pink-100 bg-white/50 min-w-0 overflow-hidden ${
                isDragging ? 'opacity-50 z-50' : ''
            }`}
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
            >
                <GripVertical className="w-4 h-4" />
            </button>

            <span className="flex-1 min-w-0 text-sm text-gray-700 truncate">{entry.title}</span>

            <Input
                type="time"
                value={entry.time_slot_start}
                onChange={e => onUpdate('time_slot_start', e.target.value)}
                className="w-[90px] flex-shrink-0 h-8 text-xs rounded-lg border-pink-200"
            />
            <span className="text-gray-400 text-xs flex-shrink-0">–</span>
            <Input
                type="time"
                value={entry.time_slot_end}
                onChange={e => onUpdate('time_slot_end', e.target.value)}
                className="w-[90px] flex-shrink-0 h-8 text-xs rounded-lg border-pink-200"
            />

            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onRemove}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg h-8 w-8 p-0"
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}
