import React from 'react';
import { Column } from './Column';

const columns = [
  {
    title: 'To Do',
    tasks: [
      { title: 'Define roadmap', description: 'Set milestones for the quarter.' },
      { title: 'Review backlog' },
    ],
  },
  {
    title: 'In Progress',
    tasks: [{ title: 'Build Kanban UI', description: 'Create columns and cards.' }],
  },
  { title: 'Review', tasks: [] },
  { title: 'Done', tasks: [{ title: 'Project setup' }] },
];

export const KanbanBoard = () => {
  return (
    <div className="board">
      <header className="board-header">Product Roadmap</header>
      <div className="board-body columns">
        {columns.map((column) => (
          <Column key={column.title} title={column.title} tasks={column.tasks} />
        ))}
      </div>
    </div>
  );
};