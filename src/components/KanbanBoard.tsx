import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column } from './Column';
import { useTaskStore } from '../store/useTaskStore';
import { AddTaskModal } from './AddTaskModal';

export const KanbanBoard = () => {
  const { tasks, columns, columnOrder, moveTask, reorderColumn } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState('');

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId) {
      reorderColumn(source.droppableId, source.index, destination.index);
      return;
    }

    moveTask(
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index,
      draggableId
    );
  };

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
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const columnTasks = column.taskIds
              .map((taskId) => tasks[taskId])
              .filter((task) =>
                `${task.title} ${task.description}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              );

            return (
              <Column
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={columnTasks}
              />
            );
          })}
          <div className="column add-column">+ Add Section</div>
        </DragDropContext>
      </div>
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};