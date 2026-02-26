import { usePage } from '@inertiajs/react';
import NavLink from './NavLink';
import DailyGoalCountdown from './DailyGoalCountdown';
import TimerMiniDisplay from './TimerMiniDisplay';
import { LayoutDashboard, ListTodo, Settings, Timer } from 'lucide-react';

export default function Navigation() {
    const { url } = usePage();

    return (
        <nav className="glass-nav sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-2 mr-6">
                            <Timer className="w-6 h-6 text-pink-500" />
                            <span className="text-lg font-bold text-gray-800">Pinkoro</span>
                        </div>
                        <NavLink href="/" active={url === '/'}>
                            <span className="flex items-center gap-1.5">
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </span>
                        </NavLink>
                        <NavLink href="/tasks" active={url.startsWith('/tasks')}>
                            <span className="flex items-center gap-1.5">
                                <ListTodo className="w-4 h-4" />
                                Tasks
                            </span>
                        </NavLink>
                        <NavLink href="/settings" active={url.startsWith('/settings')}>
                            <span className="flex items-center gap-1.5">
                                <Settings className="w-4 h-4" />
                                Settings
                            </span>
                        </NavLink>
                    </div>
                    <div className="flex items-center gap-2">
                        <DailyGoalCountdown />
                        <TimerMiniDisplay />
                    </div>
                </div>
            </div>
        </nav>
    );
}
