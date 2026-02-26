import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Save } from 'lucide-react';
import { flattenCategories } from '@/lib/categoryUtils';
import type { Task, Category } from '@/types';

interface TaskFormProps {
    open: boolean;
    onClose: () => void;
    task?: Task | null;
    categories?: Category[];
    defaultCategoryId?: number | null;
}

export default function TaskForm({ open, onClose, task, categories = [], defaultCategoryId }: TaskFormProps) {
    const initialCategoryId = task?.category_id?.toString() || defaultCategoryId?.toString() || '';

    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        title: task?.title || '',
        description: task?.description || '',
        category_id: initialCategoryId,
        priority: task?.priority || '',
        deadline: task?.deadline?.split('T')[0] || '',
        estimated_minutes: task?.estimated_minutes?.toString() || '',
    });

    transform((data) => ({
        ...data,
        category_id: data.category_id ? Number(data.category_id) : null,
        priority: data.priority || null,
        deadline: data.deadline || null,
        estimated_minutes: data.estimated_minutes ? Number(data.estimated_minutes) : null,
    }));

    const handleDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const key = e.key.toLowerCase();
        if (key === 'h' || key === 'm') {
            e.preventDefault();
            const date = new Date();
            if (key === 'm') date.setDate(date.getDate() + 1);
            setData('deadline', date.toISOString().split('T')[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (task) {
            put(route('tasks.update', task.id), {
                onSuccess: () => { reset(); onClose(); },
            });
        } else {
            post(route('tasks.store'), {
                onSuccess: () => { reset(); onClose(); },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="glass border-white/50">
                <DialogHeader>
                    <DialogTitle className="text-gray-800">
                        {task ? 'Task bearbeiten' : 'Neuer Task'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        {task ? 'Ändere die Details deines Tasks.' : 'Erstelle einen neuen Task für deine Todo-Liste.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titel</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Was möchtest du erledigen?"
                            className="rounded-xl border-pink-200 focus:ring-pink-300"
                            autoFocus
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500">{errors.title}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Beschreibung (optional)</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Zusätzliche Notizen..."
                            rows={3}
                            className="rounded-xl border-pink-200 focus:ring-pink-300 resize-y min-h-[80px]"
                        />
                        <p className="text-xs text-gray-400">Shift+Enter für neue Zeile</p>
                    </div>
                    {categories.length > 0 && (
                        <div className="space-y-2">
                            <Label>Kategorie (optional)</Label>
                            <Select
                                value={data.category_id}
                                onValueChange={(value) => setData('category_id', value === 'none' ? '' : value)}
                            >
                                <SelectTrigger className="rounded-xl border-pink-200">
                                    <SelectValue placeholder="Keine Kategorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Keine Kategorie</SelectItem>
                                    {flattenCategories(categories).map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.depth === 1 ? `└ ${cat.name}` : cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Priorität (optional)</Label>
                        <div className="flex gap-2">
                            {([
                                { value: '', label: 'Keine', color: 'border-gray-200 text-gray-500 hover:bg-gray-50', activeColor: 'bg-gray-100 border-gray-400 text-gray-700' },
                                { value: 'low', label: 'Niedrig', color: 'border-blue-200 text-blue-500 hover:bg-blue-50', activeColor: 'bg-blue-100 border-blue-400 text-blue-700' },
                                { value: 'medium', label: 'Mittel', color: 'border-amber-200 text-amber-500 hover:bg-amber-50', activeColor: 'bg-amber-100 border-amber-400 text-amber-700' },
                                { value: 'high', label: 'Hoch', color: 'border-red-200 text-red-500 hover:bg-red-50', activeColor: 'bg-red-100 border-red-400 text-red-700' },
                            ] as const).map((option) => (
                                <Button
                                    key={option.value}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setData('priority', option.value)}
                                    className={`flex-1 rounded-xl ${data.priority === option.value ? option.activeColor : option.color}`}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline (optional)</Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={data.deadline}
                                onChange={(e) => setData('deadline', e.target.value)}
                                onKeyDown={handleDateKeyDown}
                                className="rounded-xl border-pink-200 focus:ring-pink-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="estimated_minutes">Geschätzte Minuten</Label>
                            <Input
                                id="estimated_minutes"
                                type="number"
                                min={1}
                                max={9999}
                                value={data.estimated_minutes}
                                onChange={(e) => setData('estimated_minutes', e.target.value)}
                                placeholder="z.B. 60"
                                className="rounded-xl border-pink-200 focus:ring-pink-300"
                            />
                            {errors.estimated_minutes && (
                                <p className="text-sm text-red-500">{errors.estimated_minutes}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
                        >
                            {task ? (
                                <><Save className="w-4 h-4 mr-2" />Speichern</>
                            ) : (
                                <><Plus className="w-4 h-4 mr-2" />Erstellen</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
