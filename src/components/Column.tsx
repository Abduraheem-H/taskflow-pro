import React from 'react';

interface ColumnProps {
  title: string;
  count?: number;
}

export const Column = ({ title, count = 0 }: ColumnProps) => {
  return (
    <div className="column">
      <div className="column-header">
        <span>{title}</span>
        <span className="column-count">{count}</span>
      </div>
      <div className="column-body">Drop tasks here</div>
    </div>
  );
};