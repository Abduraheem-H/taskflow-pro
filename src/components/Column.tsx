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
  canDelete?: boolean;
}

export const Column = ({
  id,
  title,
  tasks,
  onAddTask,
  onRename,
  onDelete,
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
    <div className="flex flex-col w-80 shrink-0 h-full">
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest opacity-60">
            {title}
          </h3>
          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1 relative" ref={menuRef}>
          <button
            onClick={() => onAddTask?.(id)}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-brand-muted hover:text-white"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-brand-muted hover:text-white"
          >
            <MoreHorizontal size={16} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-9 w-40 bg-brand-surface border border-brand-border rounded-xl shadow-xl p-1 z-20">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onRename?.(id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-brand-muted hover:text-white hover:bg-white/5"
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
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
                  canDelete
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-brand-muted cursor-not-allowed"
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
              "flex-1 px-2 py-1 rounded-2xl transition-all min-h-[150px]",
              snapshot.isDraggingOver ? "bg-white/[0.02]" : "bg-transparent"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {tasks.length === 0 && (
              <div className="px-3 py-4 text-xs text-brand-muted border border-dashed border-brand-border/60 rounded-xl">
                No tasks yet. Add a new task to get started.
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
