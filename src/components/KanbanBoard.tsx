import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column } from './Column';
import { useTaskStore } from '../store/useTaskStore';
import { AddTaskModal } from './AddTaskModal';

export const KanbanBoard = () => {
  const { tasks } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="board">
      <header className="board-header">
        <span>Product Roadmap</span>
        <button className="primary" onClick={() => setIsModalOpen(true)}>
          Add Task
        </button>
      </header>
      <div className="board-body columns">
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map((column) => (
            <Column
              key={column.status}
              id={column.status}
              title={column.title}
              tasks={tasks.filter((task) => task.status === column.status)}
            />
          ))}
        </DragDropContext>
      </div>
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};