import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { Column } from './Column';
import { Task } from '../types/task';

interface KanbanBoardProps {
  matchesTask: (task: Task) => boolean;
  onAddTask: (columnId?: string) => void;
  onAddColumn: () => void;
  onRenameColumn: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onOpenTask: (taskId: string) => void;
}

export const KanbanBoard = ({
  matchesTask,
  onAddTask,
  onAddColumn,
  onRenameColumn,
  onDeleteColumn,
  onOpenTask
}: KanbanBoardProps) => {
  const {
    tasks,
    columns,
    columnOrder,
    moveTask,
    reorderColumn
  } = useTaskStore();

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      reorderColumn(source.droppableId, source.index, destination.index);
      return;
    }

    moveTask(source.droppableId, destination.droppableId, source.index, destination.index, draggableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-full overflow-x-auto overflow-y-hidden">
        <div className="flex h-full min-w-max gap-4 p-4">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const columnTasks = column.taskIds
              .map((taskId) => tasks[taskId])
              .filter(Boolean)
              .filter(matchesTask);

            return (
              <Column
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={columnTasks}
                onAddTask={() => onAddTask(column.id)}
                onRename={onRenameColumn}
                onDelete={onDeleteColumn}
                onOpenTask={onOpenTask}
                canDelete={columnOrder.length > 1}
              />
            );
          })}

          <div className="h-full w-72 shrink-0">
            <button
              onClick={onAddColumn}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <Plus size={16} />
              Add section
            </button>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};
