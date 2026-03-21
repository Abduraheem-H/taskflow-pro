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
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
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
            "group bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-3 transition-all hover:border-white/30 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
            snapshot.isDragging ? "shadow-2xl border-white/40 rotate-2" : ""
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
          
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-[10px] text-brand-muted">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
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
              <div className="w-6 h-6 rounded-full border border-white/10 bg-gradient-to-br from-indigo-500 to-cyan-400 text-[10px] font-bold text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
                {getInitials(task.assignee)}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
