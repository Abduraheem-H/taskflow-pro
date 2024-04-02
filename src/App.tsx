import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { KanbanBoard } from './components/KanbanBoard';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-shell">
        <aside className="sidebar">
          <h1 className="logo">TaskFlow</h1>
          <p className="sidebar-note">Boards will appear here.</p>
        </aside>
        <main className="main">
          <KanbanBoard />
        </main>
      </div>
    </QueryClientProvider>
  );
}