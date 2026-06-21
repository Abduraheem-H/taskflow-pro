# TaskFlow Pro

TaskFlow Pro is a premium Kanban workspace for planning, prioritizing, and shipping work. It combines drag-and-drop boards, rich task metadata, and a clean interface designed for focused execution.

## Tech Stack

- React 19 + Vite 6
- TypeScript
- Zustand (state + persistence)
- Tailwind CSS v4
- Hello Pangea DnD
- Gemini API via a server-only proxy using `@google/genai`

## Features

- Multi-column Kanban board with drag-and-drop
- Task priorities, tags, and timestamps
- Quick add task modal
- Search and filter across tasks
- Persistent board state
- Optional AI assistant module
- Assistant action cards for confirmed task updates and status drafts
- Toasts for task, section, assistant action, and reset feedback
- Keyboard shortcuts: `/` focuses search, `N` opens task creation, and `Esc` closes drawers/dialogs
- Task templates, comments, activity history, bulk list actions, and sample-data reset

## Screenshots

Add screenshots to `./screenshots` and update references:

- `screenshots/board.png`
- `screenshots/task-modal.png`

## Getting Started

1. Install dependencies:
   `npm install`
2. Create an `.env.locals` file with your Gemini API key:
   `GEMINI_API_KEY=your_key_here`
3. Start the dev server:
   `npm run dev`
4. Build and run the production server:
   `npm run build`
   `npm run start`

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — build for production
- `npm run preview` — preview the production build
- `npm run start` — serve the production app with the `/api/chat` proxy
- `npm run test:e2e` — run Playwright end-to-end tests
- `npm run test:e2e:ui` — open the Playwright test runner UI
- `npm run smoke` — check the production bundle and assistant proxy contract
- `npm run verify` — run typecheck, build, smoke, and Playwright checks
