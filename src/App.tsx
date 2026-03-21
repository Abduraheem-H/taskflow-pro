/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { KanbanBoard } from './components/KanbanBoard';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { AppBackdrop } from './components/AppBackdrop';

const queryClient = new QueryClient();

type ActiveView = 'board' | 'assistant';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('board');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-shell relative h-screen w-full overflow-hidden font-sans text-white">
        <AppBackdrop />
        <div className="relative z-10 h-full w-full">
          {activeView === 'board' ? (
            <div className="flex h-full w-full overflow-hidden">
              <KanbanBoard onOpenAssistant={() => setActiveView('assistant')} />
            </div>
          ) : (
            <div className="flex h-full w-full overflow-hidden">
              <Sidebar />
              <ChatWindow onBack={() => setActiveView('board')} />
            </div>
          )}
        </div>
      </div>
    </QueryClientProvider>
  );
}
