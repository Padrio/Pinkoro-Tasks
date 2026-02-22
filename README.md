# Pinkoro

A beautiful single-user Pomodoro timer app with task management, statistics, and gamification — wrapped in a glassmorphism UI with a pastel pink aesthetic.

Built with Laravel 12, React 18, TypeScript, and Inertia.js.

## Features

### Pomodoro Timer
- Configurable durations for Pomodoro, short break, long break, and custom sessions
- Persistent timer that survives page navigation
- Multiple visual display modes (ring, bar, liquid, etc.)
- Sound notifications with 9 synthesized chimes (Web Audio API, no external files)
- Pomodoro set tracking (configurable sessions per set)

### Task Management
- Create, edit, and delete tasks with optional deadlines and time estimates
- Organize tasks into categories
- Drag-and-drop reordering (tasks and categories)
- Deadline tracking with overdue/due-today/due-soon indicators
- Start Pomodoro sessions directly from a task

### Dashboard & Statistics
- Daily breakdown of completed tasks and focus minutes
- Category breakdown with accuracy tracking (estimated vs. actual time)
- Session-by-session history (last 25 Pomodoros)
- Filterable by time period (today, 7 days, 30 days)

### Gamification
- 12 achievements across bronze, silver, and gold tiers
- Level system (8 levels based on total focus minutes)
- Streak tracking (current and longest)
- Productivity score (0–100)
- Time-of-day motivational messages

### Settings
- Timer duration customization
- Sound selection and volume per event (Pomodoro end, break end, task complete)
- Timer display mode selection
- Pomodoros per set

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| PHP | ^8.2 | Runtime |
| Laravel | 12 | Framework |
| SQLite | — | Database |
| Inertia.js | 2 | Server-side adapter |
| Ziggy | 2 | Laravel route sharing |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI library |
| TypeScript | 5 | Type safety |
| Inertia.js React | 2 | Client-side adapter |
| Tailwind CSS | 4 | Utility-first styling |
| shadcn/ui (Radix) | — | Component library (new-york style) |
| Framer Motion | 12 | Animations |
| Recharts | 3 | Charts & data visualization |
| dnd-kit | 6/10 | Drag-and-drop |
| Lucide React | — | Icons |
| Vite | 7 | Build tool |

## Prerequisites

- **PHP** >= 8.2 with SQLite extension
- **Composer** >= 2
- **Node.js** >= 18 with npm

## Setup

```bash
# Clone the repository
git clone <repo-url> pinkoro
cd pinkoro

# Run the setup script (installs deps, creates .env, generates key, migrates DB, builds frontend)
composer setup

# Seed achievements (required for gamification)
php artisan db:seed --class=AchievementSeeder
```

This single command handles everything:
1. Installs PHP dependencies (`composer install`)
2. Copies `.env.example` to `.env` (if not present)
3. Generates the application key
4. Runs database migrations (creates the SQLite database)
5. Installs Node.js dependencies (`npm install`)
6. Builds the frontend (`npm run build`)

## Development

```bash
composer dev
```

This starts all services concurrently:
- **Laravel dev server** — `http://localhost:8000`
- **Vite dev server** — hot module replacement
- **Queue worker** — background jobs
- **Pail** — real-time log viewer

## Project Structure

```
app/
├── Enums/              # SessionType enum (pomodoro, short_break, long_break, custom)
├── Http/
│   ├── Controllers/    # Dashboard, Task, Category, PomodoroSession, Settings
│   └── Requests/       # Form request validation classes
├── Models/             # Task, PomodoroSession, Category, Achievement, Setting, ...
└── Services/           # SettingsService, StatisticsService, GamificationService

resources/js/
├── Pages/              # Dashboard.tsx, Tasks.tsx, Settings.tsx
├── components/
│   ├── layout/         # AppLayout, Navigation, NavLink, TimerMiniDisplay
│   ├── timer/          # TimerWidget, CircularProgress, DigitalDisplay, ...
│   ├── dashboard/      # StatsGrid, StatCard, Charts, StreakWidget, LevelWidget, ...
│   ├── tasks/          # TaskList, TaskItem, TaskForm, CategorySection, ...
│   ├── settings/       # TimerSettings, SoundSettings, SettingsSection
│   └── ui/             # shadcn/ui primitives (Button, Dialog, Select, ...)
├── contexts/           # TimerContext, SoundContext
├── lib/                # Chime audio synthesis, time formatting utilities
└── types/              # Global TypeScript interfaces

database/
├── migrations/         # 13 migration files
└── seeders/            # AchievementSeeder, SettingsSeeder
```

## Database Schema

| Table | Purpose |
|---|---|
| `tasks` | Task title, description, deadline, estimated minutes, completion state, category, sort order |
| `categories` | Named groups for organizing tasks |
| `pomodoro_sessions` | Timer sessions linked to tasks — type, duration, start/end timestamps, completion |
| `settings` | Key-value JSON store for all app configuration |
| `achievements` | Achievement definitions (key, name, icon, tier, threshold) |
| `user_achievements` | Tracks which achievements have been unlocked |

## Testing

```bash
composer test
```

Uses an in-memory SQLite database for fast, isolated test runs.

## License

MIT
