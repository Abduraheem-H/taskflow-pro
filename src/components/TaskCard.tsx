import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, Priority } from '../types/task';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  index: number;
}

const priorityColors: Record<Priority, string> = {
  low: 'priority low',
  medium: 'priority medium',
  high: 'priority high'
};

export const TaskCard = ({ task, index }: TaskCardProps) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="task-card"
        >
          <div className="task-meta">
            <span className={priorityColors[task.priority]}>{task.priority}</span>
            <span className="task-date">{format(task.createdAt, 'MMM d')}</span>
          </div>
          <h4>{task.title}</h4>
          <p>{task.description}</p>
          {task.tags.length > 0 && (
            <div className="task-tags">
              {task.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};