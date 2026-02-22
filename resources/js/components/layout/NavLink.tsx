import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface NavLinkProps {
    href: string;
    active: boolean;
    children: React.ReactNode;
}

export default function NavLink({ href, active, children }: NavLinkProps) {
    return (
        <Link
            href={href}
            className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-xl ${
                active
                    ? 'text-pink-700'
                    : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            {children}
            {active && (
                <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-white/50 rounded-xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
            )}
        </Link>
    );
}
