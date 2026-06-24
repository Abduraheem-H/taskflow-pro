import React, { useEffect, useRef, useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { Task } from '../types/task';
import { Plus, MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask?: (columnId: string) => void;
  onRename?: (columnId: string) => void;
  onDelete?: (columnId: string) => void;
  onOpenTask?: (taskId: string) => void;
  canDelete?: boolean;
}

export const Column = ({
  id,
  title,
  tasks,
  onAddTask,
  onRename,
  onDelete,
  onOpenTask,
  canDelete = true
}: ColumnProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="flex h-full w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase text-slate-500">
            {title}
          </h3>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1 relative" ref={menuRef}>
          <button
            onClick={() => onAddTask?.(id)}
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
            aria-label={`Add task to ${title}`}
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
            aria-label={`${title} options`}
          >
            <MoreHorizontal size={16} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-9 z-20 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onRename?.(id);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                <PencilLine size={14} />
                Rename
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  if (canDelete) {
                    onDelete?.(id);
                  }
                }}
                disabled={!canDelete}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs",
                  canDelete
                    ? "text-red-600 hover:bg-red-50"
                    : "cursor-not-allowed text-slate-400"
                )}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "min-h-[150px] flex-1 rounded-lg border border-slate-200 bg-slate-50/70 p-2 transition-colors",
              snapshot.isDraggingOver ? "border-blue-300 bg-blue-50" : ""
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onOpen={onOpenTask} />
            ))}
            {tasks.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-4 text-xs leading-5 text-slate-500">
                No tasks yet. Add one to start this section.
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
