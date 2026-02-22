import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderPlus, Check, X } from 'lucide-react';

export default function CategoryCreateButton() {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');

    const handleCreate = () => {
        if (!name.trim()) return;
        router.post(route('categories.store'), { name: name.trim() }, {
            preserveState: true,
            onSuccess: () => { setName(''); setIsCreating(false); },
        });
    };

    if (!isCreating) {
        return (
            <Button
                onClick={() => setIsCreating(true)}
                variant="outline"
                size="sm"
                className="rounded-xl border-pink-200 hover:bg-pink-50 text-gray-600"
            >
                <FolderPlus className="w-4 h-4 mr-2" />
                Kategorie
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kategoriename..."
                className="h-9 w-40 rounded-xl border-pink-200 text-sm"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') { setIsCreating(false); setName(''); }
                }}
            />
            <Button size="sm" variant="ghost" onClick={handleCreate} className="h-8 w-8 p-0 text-green-500">
                <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setIsCreating(false); setName(''); }} className="h-8 w-8 p-0 text-gray-400">
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}
