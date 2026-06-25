import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, Flame, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import { Column, Task } from '../types/task';
import { WorkspaceProject } from '../data/workspace';
import { cn } from '../lib/utils';

type WorkspaceView = 'overview' | 'board' | 'list' | 'timeline';

export interface WorkspaceAlert {
  id: string;
  title: string;
  detail: string;
  tone: 'red' | 'amber' | 'blue';
}

interface OverviewProps {
  project: WorkspaceProject;
  tasks: Task[];
  columns: Record<string, Column>;
  columnOrder: string[];
  alerts: WorkspaceAlert[];
  onOpenTask: (taskId: string) => void;
  onViewChange: (view: WorkspaceView) => void;
}

const doneLike = (task: Task) => task.status.toLowerCase().includes('done');

export const Overview = ({
  project,
  tasks,
  columns,
  columnOrder,
  alerts,
  onOpenTask,
  onViewChange
}: OverviewProps) => {
  const openTasks = tasks.filter((task) => !doneLike(task));
  const completedTasks = tasks.length - openTasks.length;
  const highPriorityTasks = openTasks.filter((task) => task.priority === 'high');
  const datedTasks = tasks
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate ?? '').getTime() - new Date(b.dueDate ?? '').getTime());
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const stats = [
    {
      label: 'Open tasks',
      value: openTasks.length,
      icon: ListChecks,
      detail: `${tasks.length} total`
    },
    {
      label: 'Completion',
      value: `${completionRate}%`,
      icon: CheckCircle2,
      detail: `${completedTasks} completed`
    },
    {
      label: 'High priority',
      value: highPriorityTasks.length,
      icon: Flame,
      detail: 'Needs focus'
    },
    {
      label: 'Scheduled',
      value: datedTasks.length,
      icon: Clock3,
      detail: 'With due dates'
    }
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <Icon size={16} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-semibold text-slate-950">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-950">{project.name} flow</h3>
              <p className="mt-1 text-sm text-slate-500">Task distribution by section.</p>
            </div>
            <button
              onClick={() => onViewChange('board')}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Board
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {columnOrder.map((columnId) => {
              const column = columns[columnId];
              const count = tasks.filter((task) => task.status === columnId).length;
              const width = tasks.length > 0 ? Math.max(8, Math.round((count / tasks.length) * 100)) : 0;

              return (
                <div key={columnId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{column?.title ?? 'Untitled'}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Workspace alerts</h3>
              <p className="mt-1 text-sm text-slate-500">Derived from the active project.</p>
            </div>
            <AlertCircle size={18} className="text-slate-400" />
          </div>

          <div className="space-y-2">
            {alerts.length > 0 ? (
              alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'rounded-lg border p-3',
                    alert.tone === 'red' && 'border-red-200 bg-red-50 text-red-800',
                    alert.tone === 'amber' && 'border-amber-200 bg-amber-50 text-amber-800',
                    alert.tone === 'blue' && 'border-blue-200 bg-blue-50 text-blue-800'
                  )}
                >
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className="mt-1 text-xs leading-5 opacity-80">{alert.detail}</p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                No urgent alerts for this project.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">Upcoming work</h3>
            <p className="mt-1 text-sm text-slate-500">Tasks sorted by due date.</p>
          </div>
          <button
            onClick={() => onViewChange('timeline')}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Timeline
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid gap-2 lg:grid-cols-2">
          {datedTasks.slice(0, 6).map((task) => (
            <button
              key={task.id}
              onClick={() => onOpenTask(task.id)}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{task.title}</p>
                <p className="mt-1 text-xs text-slate-500">{columns[task.status]?.title ?? 'Unknown'}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-500">
                {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '-'}
              </span>
            </button>
          ))}

          {datedTasks.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              Add due dates to build a timeline.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
