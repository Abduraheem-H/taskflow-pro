import React from 'react';
import { KanbanBoard } from './components/KanbanBoard';

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="logo">TaskFlow</h1>
        <p className="sidebar-note">Boards will appear here.</p>
      </aside>
      <main className="main">
        <KanbanBoard />
      </main>
    </div>
  );
}