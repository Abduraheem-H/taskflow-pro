/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { KanbanBoard } from './components/KanbanBoard';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';

const queryClient = new QueryClient();

type ActiveView = 'board' | 'assistant';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('board');

  return (
    <QueryClientProvider client={queryClient}>
      {activeView === 'board' ? (
        <div className="flex h-screen w-full overflow-hidden font-sans">
          <KanbanBoard onOpenAssistant={() => setActiveView('assistant')} />
        </div>
      ) : (
        <div className="flex h-screen w-full overflow-hidden font-sans">
          <Sidebar />
          <ChatWindow onBack={() => setActiveView('board')} />
        </div>
      )}
    </QueryClientProvider>
  );
}
