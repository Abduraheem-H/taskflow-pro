import React from 'react';
import { Column } from './Column';
import { useTaskStore } from '../store/useTaskStore';

export const KanbanBoard = () => {
  const { tasks } = useTaskStore();

  const columns = [
    { title: 'To Do', status: 'todo' },
    { title: 'In Progress', status: 'in-progress' },
    { title: 'Review', status: 'review' },
    { title: 'Done', status: 'done' },
  ];

  return (
    <div className="board">
      <header className="board-header">Product Roadmap</header>
      <div className="board-body columns">
        {columns.map((column) => (
          <Column
            key={column.status}
            title={column.title}
            tasks={tasks.filter((task) => task.status === column.status)}
          />
        ))}
      </div>
    </div>
  );
};