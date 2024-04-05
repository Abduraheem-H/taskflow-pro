# TaskFlow Pro

TaskFlow Pro is a premium Kanban workspace for planning, prioritizing, and shipping work. It combines drag-and-drop boards, rich task metadata, and a clean interface designed for focused execution.

## Tech Stack

- React 19 + Vite 6
- TypeScript
- Zustand (state + persistence)
- Tailwind CSS v4
- Hello Pangea DnD
- Gemini API via `@google/genai`

## Features

- Multi-column Kanban board with drag-and-drop
- Task priorities, tags, and timestamps
- Quick add task modal
- Search and filter across tasks
- Persistent board state
- Optional AI assistant module

## Screenshots

Add screenshots to `./screenshots` and update references:

- `screenshots/board.png`
- `screenshots/task-modal.png`

## Getting Started

1. Install dependencies:
   `npm install`
2. Create an `.env.local` file with your Gemini API key:
   `GEMINI_API_KEY=your_key_here`
3. Start the dev server:
   `npm run dev`

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — build for production
- `npm run preview` — preview the production build