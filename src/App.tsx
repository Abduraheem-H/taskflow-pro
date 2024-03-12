import React from 'react';

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="logo">TaskFlow</h1>
        <p className="sidebar-note">Boards will appear here.</p>
      </aside>
      <main className="main">
        <header className="header">Product Roadmap</header>
        <section className="content">
          <p>Build your first board.</p>
        </section>
      </main>
    </div>
  );
}