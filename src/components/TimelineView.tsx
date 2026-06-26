import React from 'react';
import { CalendarClock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { Column, Task } from '../types/task';
import { cn } from '../lib/utils';

interface TimelineViewProps {
  tasks: Task[];
  columns: Record<string, Column>;
  onOpenTask: (taskId: string) => void;
}

export const TimelineView = ({ tasks, columns, onOpenTask }: TimelineViewProps) => {
  const datedTasks = tasks
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate ?? '').getTime() - new Date(b.dueDate ?? '').getTime());

  const unscheduledTasks = tasks.filter((task) => !task.dueDate);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-950">Timeline</h3>
          <p className="mt-1 text-sm text-slate-500">Date-based plan for the active project.</p>
        </div>

        <div className="divide-y divide-slate-100">
          {datedTasks.length > 0 ? (
            datedTasks.map((task) => {
              const due = new Date(task.dueDate ?? '');
              const overdue = isPast(due) && !isToday(due) && task.status !== 'done';

              return (
                <button
                  key={task.id}
                  onClick={() => onOpenTask(task.id)}
                  className="grid w-full grid-cols-[112px_1fr] gap-4 px-5 py-4 text-left transition-colors hover:bg-blue-50/60"
                >
                  <div>
                    <p className={cn('text-sm font-semibold', overdue ? 'text-red-700' : 'text-slate-950')}>
                      {format(due, 'MMM d')}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{format(due, 'EEE')}</p>
                  </div>
                  <div className="min-w-0 border-l border-slate-200 pl-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-950">{task.title}</p>
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase',
                          task.priority === 'high' && 'border-red-200 bg-red-50 text-red-700',
                          task.priority === 'medium' && 'border-amber-200 bg-amber-50 text-amber-700',
                          task.priority === 'low' && 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{task.description}</p>
                    <p className="mt-2 text-xs font-medium text-slate-500">{columns[task.status]?.title ?? 'Unknown'}</p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <CalendarClock size={18} />
              </div>
              <p className="text-sm font-semibold text-slate-950">No scheduled work yet</p>
              <p className="mt-1 text-sm text-slate-500">Add due dates to tasks to populate the timeline.</p>
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-950">Unscheduled</h3>
        <p className="mt-1 text-sm text-slate-500">Tasks without due dates.</p>

        <div className="mt-4 space-y-2">
          {unscheduledTasks.length > 0 ? (
            unscheduledTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onOpenTask(task.id)}
                className="w-full rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50"
              >
                <p className="line-clamp-1 text-sm font-semibold text-slate-950">{task.title}</p>
                <p className="mt-1 text-xs text-slate-500">{columns[task.status]?.title ?? 'Unknown'}</p>
              </button>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              Every visible task has a due date.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
