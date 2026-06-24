import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, Priority } from '../types/task';
import { cn } from '../lib/utils';
import { Calendar, CircleDot, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  index: number;
  onOpen?: (taskId: string) => void;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200'
};

const getInitials = (name?: string) => {
  if (!name) return '??';
  const parts = name.split(' ').filter(Boolean);
  const initials = parts.map((part) => part[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

export const TaskCard = ({ task, index, onOpen }: TaskCardProps) => {
  const dueDateLabel = task.dueDate ? format(new Date(task.dueDate), 'MMM d') : null;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen?.(task.id)}
          className={cn(
            "group mb-2 cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-blue-200 hover:shadow-md",
            snapshot.isDragging ? "rotate-1 border-blue-300 shadow-xl" : ""
          )}
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <span className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
              priorityColors[task.priority]
            )}>
              {task.priority}
            </span>
            <button
              onClick={(event) => {
                event.stopPropagation();
                onOpen?.(task.id);
              }}
              className="rounded-md p-1 text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
              aria-label={`Open ${task.title}`}
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
          
          <h4 className="mb-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-950">{task.title}</h4>
          <p className="mb-3 line-clamp-3 text-xs leading-5 text-slate-500">
            {task.description}
          </p>

          {task.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <CircleDot size={12} />
                <span>{format(task.createdAt, 'MMM d')}</span>
              </span>
              {dueDateLabel && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>{dueDateLabel}</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-[10px] font-bold text-white">
                {getInitials(task.assignee)}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
