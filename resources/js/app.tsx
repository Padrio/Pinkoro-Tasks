import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import AppLayout from '@/components/layout/AppLayout';

const appName = import.meta.env.VITE_APP_NAME || 'Pinkoro';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ).then((module: any) => {
            const page = module.default;
            page.layout = page.layout || ((page: React.ReactNode) => (
                <AppLayout>{page}</AppLayout>
            ));
            return module;
        }),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#F9A8D4',
    },
});
