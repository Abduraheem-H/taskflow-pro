import React from 'react';
import { format } from 'date-fns';
import { Task, Priority, Column } from '../types/task';
import { cn } from '../lib/utils';

interface TaskListProps {
  tasks: Task[];
  columns: Record<string, Column>;
  onOpenTask?: (taskId: string) => void;
}

const priorityStyles: Record<Priority, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200'
};

const getInitials = (name?: string) => {
  if (!name) return '--';
  const parts = name.split(' ').filter(Boolean);
  const initials = parts.map((part) => part[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

export const TaskList = ({ tasks, columns, onOpenTask }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-16 text-sm text-slate-500">
        No tasks match your search.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase text-slate-500 md:grid">
        <div className="col-span-4">Task</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-2">Tags</div>
        <div className="col-span-1 text-center">Owner</div>
        <div className="col-span-1 text-right">Due</div>
      </div>

      <div className="divide-y divide-slate-100">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onOpenTask?.(task.id)}
            className="grid w-full grid-cols-1 gap-3 px-4 py-4 text-left transition-colors hover:bg-blue-50/60 md:grid-cols-12 md:items-center md:gap-4"
          >
            <div className="md:col-span-4">
              <p className="line-clamp-1 text-sm font-semibold text-slate-950">{task.title}</p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                {task.description}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
                {columns[task.status]?.title ?? 'Unknown'}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className={cn(
                'rounded-full border px-2 py-1 text-[10px] font-semibold uppercase',
                priorityStyles[task.priority]
              )}>
                {task.priority}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 md:col-span-2">
              {task.tags.length > 0 ? (
                task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">-</span>
              )}
            </div>
            <div className="flex md:col-span-1 md:justify-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-[10px] font-semibold text-white">
                {getInitials(task.assignee)}
              </div>
            </div>
            <div className="text-xs text-slate-500 md:col-span-1 md:text-right">
              {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '-'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
