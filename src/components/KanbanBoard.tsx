import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column } from './Column';
import { useTaskStore } from '../store/useTaskStore';
import { AddTaskModal } from './AddTaskModal';

export const KanbanBoard = () => {
  const { tasks } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState('');

  const columns = [
    { title: 'To Do', status: 'todo' },
    { title: 'In Progress', status: 'in-progress' },
    { title: 'Review', status: 'review' },
    { title: 'Done', status: 'done' },
  ];

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
  };

  const filteredTasks = tasks.filter((task) =>
    `${task.title} ${task.description}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="board">
      <header className="board-header">
        <div>
          <div className="board-title">Product Roadmap</div>
          <p className="board-subtitle">Track priorities across the team.</p>
        </div>
        <div className="board-actions">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks"
            className="search"
          />
          <button className="primary" onClick={() => setIsModalOpen(true)}>
            Add Task
          </button>
        </div>
      </header>
      <div className="board-body columns">
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map((column) => (
            <Column
              key={column.status}
              id={column.status}
              title={column.title}
              tasks={filteredTasks.filter((task) => task.status === column.status)}
            />
          ))}
        </DragDropContext>
      </div>
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};