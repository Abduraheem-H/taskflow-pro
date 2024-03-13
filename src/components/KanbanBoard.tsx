import React from 'react';
import { Column } from './Column';

const columns = [
  { title: 'To Do', count: 0 },
  { title: 'In Progress', count: 0 },
  { title: 'Review', count: 0 },
  { title: 'Done', count: 0 },
];

export const KanbanBoard = () => {
  return (
    <div className="board">
      <header className="board-header">Product Roadmap</header>
      <div className="board-body columns">
        {columns.map((column) => (
          <Column key={column.title} title={column.title} count={column.count} />
        ))}
      </div>
    </div>
  );
};