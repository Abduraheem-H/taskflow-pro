/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { KanbanBoard } from './components/KanbanBoard';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full overflow-hidden font-sans">
        <KanbanBoard />
      </div>
    </QueryClientProvider>
  );
}


