import React from 'react';
import { format } from 'date-fns';
import { Task, Priority, Column } from '../types/task';
import { cn } from '../lib/utils';

interface TaskListProps {
  tasks: Task[];
  columns: Record<string, Column>;
}

const priorityStyles: Record<Priority, string> = {
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  high: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
};

export const TaskList = ({ tasks, columns }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-16 text-sm text-brand-muted">
        No tasks match your search.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-4 px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-brand-muted border-b border-brand-border">
        <div className="col-span-5">Task</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-2">Tags</div>
        <div className="col-span-1 text-right">Created</div>
      </div>

      <div className="divide-y divide-brand-border/60">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors"
          >
            <div className="col-span-5">
              <p className="text-sm font-medium line-clamp-1">{task.title}</p>
              <p className="text-xs text-brand-muted line-clamp-1 mt-1">
                {task.description}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 border border-white/10">
                {columns[task.status]?.title ?? 'Unknown'}
              </span>
            </div>
            <div className="col-span-2">
              <span className={cn(
                "px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
                priorityStyles[task.priority]
              )}>
                {task.priority}
              </span>
            </div>
            <div className="col-span-2 flex flex-wrap gap-1">
              {task.tags.length > 0 ? (
                task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-brand-muted">—</span>
              )}
            </div>
            <div className="col-span-1 text-right text-xs text-brand-muted">
              {format(task.createdAt, 'MMM d')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
