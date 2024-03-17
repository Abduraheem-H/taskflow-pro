import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';
import { Plus, MoreHorizontal } from 'lucide-react';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export const Column = ({ id, title, tasks }: ColumnProps) => {
  return (
    <div className="column">
      <div className="column-header">
        <div className="column-title">
          <span>{title}</span>
          <span className="column-count">{tasks.length}</span>
        </div>
        <div className="column-actions">
          <button className="icon-button">
            <Plus size={14} />
          </button>
          <button className="icon-button">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
      <Droppable droppableId={id}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="column-body">
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};