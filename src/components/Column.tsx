import React from 'react';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  title: string;
  tasks: { title: string; description?: string }[];
}

export const Column = ({ title, tasks }: ColumnProps) => {
  return (
    <div className="column">
      <div className="column-header">
        <span>{title}</span>
        <span className="column-count">{tasks.length}</span>
      </div>
      <div className="column-body">
        {tasks.map((task) => (
          <TaskCard key={task.title} title={task.title} description={task.description} />
        ))}
      </div>
    </div>
  );
};