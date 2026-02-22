import { ReactNode } from 'react';

interface SettingsSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
}

export default function SettingsSection({ title, description, children }: SettingsSectionProps) {
    return (
        <div className="glass p-6 space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                {description && (
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}
