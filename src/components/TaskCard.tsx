import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, Priority } from '../types/task';
import { cn } from '../lib/utils';
import { Clock, MoreHorizontal, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  index: number;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  high: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
};

const getInitials = (name?: string) => {
  if (!name) return '??';
  const parts = name.split(' ').filter(Boolean);
  const initials = parts.map((part) => part[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

export const TaskCard = ({ task, index }: TaskCardProps) => {
  const dueDateLabel = task.dueDate ? format(new Date(task.dueDate), 'MMM d') : null;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "group bg-brand-surface border border-brand-border rounded-xl p-4 mb-3 transition-all hover:border-white/20 hover:shadow-lg",
            snapshot.isDragging ? "shadow-2xl border-white/30 rotate-2" : ""
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
              priorityColors[task.priority]
            )}>
              {task.priority}
            </span>
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded-md transition-all">
              <MoreHorizontal size={14} className="text-brand-muted" />
            </button>
          </div>
          
          <h4 className="text-sm font-medium mb-1 line-clamp-2">{task.title}</h4>
          <p className="text-xs text-brand-muted mb-4 line-clamp-3 leading-relaxed">
            {task.description}
          </p>
          
          <div className="flex items-center justify-between pt-3 border-t border-brand-border/50">
            <div className="flex items-center gap-2 text-[10px] text-brand-muted">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>{format(task.createdAt, 'MMM d')}</span>
              </span>
              {dueDateLabel && (
                <span className="flex items-center gap-1.5 text-brand-muted">
                  <Calendar size={12} />
                  <span>{dueDateLabel}</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-brand-surface bg-gradient-to-br from-indigo-500 to-purple-500 text-[10px] font-bold text-white flex items-center justify-center">
                {getInitials(task.assignee)}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
