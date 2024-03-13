import React from 'react';

interface TaskCardProps {
  title: string;
  description?: string;
}

export const TaskCard = ({ title, description }: TaskCardProps) => {
  return (
    <div className="task-card">
      <h4>{title}</h4>
      {description && <p>{description}</p>}
    </div>
  );
};