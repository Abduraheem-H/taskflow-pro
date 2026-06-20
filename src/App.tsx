import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  Filter,
  KanbanSquare,
  List,
  Plus,
  RotateCcw,
  Search,
  Sparkles
} from 'lucide-react';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskList } from './components/TaskList';
import { AddTaskModal } from './components/AddTaskModal';
import { ChatWindow } from './components/ChatWindow';
import { Overview, WorkspaceAlert } from './components/Overview';
import { TimelineView } from './components/TimelineView';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { ColumnDialog } from './components/ColumnDialog';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ToastMessage, ToastStack } from './components/ToastStack';
import { useTaskStore } from './store/useTaskStore';
import { AssistantAction } from './types/chat';
import { Priority, Task } from './types/task';
import { WORKSPACE_PROJECTS } from './data/workspace';
import { cn } from './lib/utils';

const queryClient = new QueryClient();

type WorkspaceView = 'overview' | 'board' | 'list' | 'timeline';

const VIEW_ITEMS: Array<{ id: WorkspaceView; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'board', label: 'Board', icon: KanbanSquare },
  { id: 'list', label: 'List', icon: List },
  { id: 'timeline', label: 'Timeline', icon: CalendarDays }
];

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

const isTaskDone = (task: Task) => task.status.toLowerCase().includes('done');

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  date.setDate(date.getDate() + days);
  return date;
};

export default function App() {
  const {
    tasks,
    columns,
    columnOrder,
    addTask,
    updateTask,
    addColumn,
    renameColumn,
    deleteColumn,
    deleteTask,
    resetWorkspace
  } = useTaskStore();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeView, setActiveView] = useState<WorkspaceView>('overview');
  const [activeProjectId, setActiveProjectId] = useState(WORKSPACE_PROJECTS[0]?.id ?? 'roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePriorities, setActivePriorities] = useState<Priority[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [columnDialog, setColumnDialog] = useState<{ mode: 'add' | 'rename'; columnId?: string } | null>(null);
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [pendingAssistantAction, setPendingAssistantAction] = useState<AssistantAction | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const activeProject = WORKSPACE_PROJECTS.find((project) => project.id === activeProjectId) ?? WORKSPACE_PROJECTS[0];
  const selectedTask = selectedTaskId ? tasks[selectedTaskId] ?? null : null;
  const deleteColumnTarget = deleteColumnId ? columns[deleteColumnId] : null;
  const deleteTaskTarget = deleteTaskId ? tasks[deleteTaskId] : null;
  const bulkDeleteTargets = bulkDeleteIds.map((taskId) => tasks[taskId]).filter(Boolean);

  const allTasks = useMemo(
    () =>
      columnOrder.flatMap((columnId) =>
        (columns[columnId]?.taskIds ?? [])
          .map((taskId) => tasks[taskId])
          .filter(Boolean)
      ),
    [columnOrder, columns, tasks]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchesTask = (task: Task) => {
    const matchesProject = task.projectId === activeProjectId;
    const matchesPriority = activePriorities.length === 0 || activePriorities.includes(task.priority);
    const haystack = [task.title, task.description, task.assignee, ...task.tags].join(' ').toLowerCase();
    const matchesSearch = !normalizedQuery || haystack.includes(normalizedQuery);
    return matchesProject && matchesPriority && matchesSearch;
  };

  const projectTasks = allTasks.filter((task) => task.projectId === activeProjectId);
  const visibleTasks = allTasks.filter(matchesTask);

  const alerts = useMemo<WorkspaceAlert[]>(() => {
    const now = new Date();
    const soon = daysFromNow(3);
    const openProjectTasks = projectTasks.filter((task) => !isTaskDone(task));
    const overdue = openProjectTasks.filter((task) => task.dueDate && new Date(task.dueDate) < now);
    const dueSoon = openProjectTasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= soon;
    });
    const highPriority = openProjectTasks.filter((task) => task.priority === 'high');
    const nextAlerts: WorkspaceAlert[] = [];

    if (overdue.length > 0) {
      nextAlerts.push({
        id: 'overdue',
        title: `${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}`,
        detail: 'Review dates or move completed work to Done.',
        tone: 'red'
      });
    }

    if (dueSoon.length > 0) {
      nextAlerts.push({
        id: 'due-soon',
        title: `${dueSoon.length} due soon`,
        detail: 'These tasks are scheduled within the next three days.',
        tone: 'amber'
      });
    }

    if (highPriority.length > 0) {
      nextAlerts.push({
        id: 'high-priority',
        title: `${highPriority.length} high priority open`,
        detail: 'Keep the highest-impact work visible during planning.',
        tone: 'blue'
      });
    }

    return nextAlerts;
  }, [projectTasks]);

  const workspaceContext = useMemo(() => {
    const statusLines = columnOrder
      .map((columnId) => {
        const count = projectTasks.filter((task) => task.status === columnId).length;
        return `${columns[columnId]?.title ?? columnId}: ${count}`;
      })
      .join(', ');

    const focusTasks = visibleTasks
      .slice(0, 8)
      .map((task) => {
        const due = task.dueDate ? `, due ${new Date(task.dueDate).toLocaleDateString()}` : '';
        return `- ${task.title} (${task.priority}, ${columns[task.status]?.title ?? task.status}${due})`;
      })
      .join('\n');

    return [
      `Active project: ${activeProject?.name ?? 'Workspace'}`,
      `Visible tasks: ${visibleTasks.length}`,
      `Status counts: ${statusLines}`,
      focusTasks ? `Current visible tasks:\n${focusTasks}` : 'No visible tasks match the current filters.'
    ].join('\n');
  }, [activeProject?.name, columnOrder, columns, projectTasks, visibleTasks]);

  const assistantSuggestions = [
    `Summarize ${activeProject?.name ?? 'this project'} for a weekly update.`,
    'Which visible task should I tackle first and why?',
    'Break high priority work into next steps.',
    'Draft a short risk and blocker note from this board.'
  ];

  const pushToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  };

  const openCreateTask = (columnId?: string) => {
    setCreateColumnId(columnId ?? columnOrder[0] ?? null);
    setIsCreateOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (event.key === 'Escape') {
        setSelectedTaskId(null);
        setAssistantOpen(false);
        setAlertsOpen(false);
        setColumnDialog(null);
        setDeleteColumnId(null);
        setDeleteTaskId(null);
        setBulkDeleteIds([]);
        setPendingAssistantAction(null);
        return;
      }

      if (isTyping) return;

      if (event.key === '/') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        openCreateTask();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [columnOrder]);

  const togglePriority = (priority: Priority) => {
    setActivePriorities((current) =>
      current.includes(priority)
        ? current.filter((item) => item !== priority)
        : [...current, priority]
    );
  };

  const buildAssistantActions = (prompt: string, response: string): AssistantAction[] => {
    const firstColumnId = columnOrder[0] ?? 'todo';
    const openTask = visibleTasks.find((task) => !isTaskDone(task));
    const priorityCandidate = visibleTasks.find((task) => !isTaskDone(task) && task.priority !== 'high') ?? openTask;
    const statusDraft = [
      `${activeProject?.name ?? 'Project'} status update`,
      '',
      `Visible work: ${visibleTasks.length} task${visibleTasks.length === 1 ? '' : 's'}.`,
      alerts.length > 0 ? `Attention: ${alerts.map((alert) => alert.title).join(', ')}.` : 'No urgent alerts right now.',
      '',
      response.slice(0, 800)
    ].join('\n');

    const actions: AssistantAction[] = [
      {
        id: crypto.randomUUID(),
        type: 'create-task',
        label: 'Create follow-up task',
        description: 'Add a medium-priority task from this assistant request.',
        mutates: true,
        payload: {
          title: `Follow up: ${prompt.slice(0, 48)}`,
          description: `Created from assistant prompt: ${prompt}`,
          priority: 'medium',
          status: firstColumnId,
          projectId: activeProjectId,
          tags: ['assistant']
        }
      },
      {
        id: crypto.randomUUID(),
        type: 'copy-status',
        label: 'Copy status update',
        description: 'Copy a concise project update to your clipboard.',
        mutates: false,
        payload: {
          content: statusDraft
        }
      }
    ];

    if (priorityCandidate) {
      actions.splice(1, 0, {
        id: crypto.randomUUID(),
        type: 'update-priority',
        label: `Mark "${priorityCandidate.title}" high priority`,
        description: 'Promote this visible task for focused execution.',
        mutates: true,
        payload: {
          taskId: priorityCandidate.id,
          priority: 'high'
        }
      });
    }

    return actions;
  };

  const handleAssistantAction = async (action: AssistantAction) => {
    if (action.mutates) {
      setPendingAssistantAction(action);
      return;
    }

    if (action.type === 'copy-status' && action.payload.content) {
      if (!navigator.clipboard) {
        pushToast({
          title: 'Clipboard unavailable',
          description: 'Your browser did not allow clipboard access.',
          tone: 'info'
        });
        return;
      }

      await navigator.clipboard.writeText(action.payload.content);
      pushToast({
        title: 'Status update copied',
        description: 'The assistant draft is ready to paste.',
        tone: 'success'
      });
    }
  };

  const handleConfirmAssistantAction = () => {
    if (!pendingAssistantAction) return;

    if (pendingAssistantAction.type === 'create-task') {
      addTask(
        pendingAssistantAction.payload.status ?? columnOrder[0],
        pendingAssistantAction.payload.title ?? 'Assistant follow-up',
        pendingAssistantAction.payload.description ?? '',
        pendingAssistantAction.payload.priority ?? 'medium',
        'You',
        undefined,
        pendingAssistantAction.payload.projectId ?? activeProjectId,
        pendingAssistantAction.payload.tags ?? ['assistant']
      );
      pushToast({
        title: 'Assistant task created',
        description: pendingAssistantAction.payload.title,
        tone: 'success'
      });
    }

    if (
      pendingAssistantAction.type === 'update-priority' &&
      pendingAssistantAction.payload.taskId &&
      pendingAssistantAction.payload.priority
    ) {
      updateTask(pendingAssistantAction.payload.taskId, {
        priority: pendingAssistantAction.payload.priority
      });
      pushToast({
        title: 'Priority updated',
        description: 'Assistant action applied after confirmation.',
        tone: 'success'
      });
    }

    setPendingAssistantAction(null);
  };

  const handleBulkUpdate = (taskIds: string[], updates: Partial<Task>) => {
    taskIds.forEach((taskId) => updateTask(taskId, updates));
    pushToast({
      title: 'Bulk update applied',
      description: `${taskIds.length} task${taskIds.length === 1 ? '' : 's'} updated.`,
      tone: 'success'
    });
  };

  const handleColumnDialogSubmit = (title: string) => {
    if (columnDialog?.mode === 'add') {
      addColumn(title);
      pushToast({ title: 'Section added', description: title, tone: 'success' });
    }

    if (columnDialog?.mode === 'rename' && columnDialog.columnId) {
      renameColumn(columnDialog.columnId, title);
      pushToast({ title: 'Section renamed', description: title, tone: 'success' });
    }

    setColumnDialog(null);
  };

  const handleConfirmDeleteColumn = () => {
    if (!deleteColumnId) return;
    const title = columns[deleteColumnId]?.title;
    deleteColumn(deleteColumnId);
    setDeleteColumnId(null);
    pushToast({ title: 'Section deleted', description: title, tone: 'success' });
  };

  const handleConfirmDeleteTask = () => {
    if (!deleteTaskId) return;
    const title = tasks[deleteTaskId]?.title;
    deleteTask(deleteTaskId);
    if (selectedTaskId === deleteTaskId) {
      setSelectedTaskId(null);
    }
    setDeleteTaskId(null);
    pushToast({ title: 'Task deleted', description: title, tone: 'success' });
  };

  const handleConfirmBulkDelete = () => {
    bulkDeleteIds.forEach((taskId) => deleteTask(taskId));
    pushToast({
      title: 'Tasks deleted',
      description: `${bulkDeleteIds.length} task${bulkDeleteIds.length === 1 ? '' : 's'} removed.`,
      tone: 'success'
    });
    setBulkDeleteIds([]);
  };

  const handleConfirmReset = () => {
    resetWorkspace();
    setSearchQuery('');
    setActivePriorities([]);
    setSelectedTaskId(null);
    setResetConfirmOpen(false);
    pushToast({
      title: 'Sample workspace restored',
      description: 'Tasks and sections are back to the starter data.',
      tone: 'success'
    });
  };

  const activeViewLabel = VIEW_ITEMS.find((item) => item.id === activeView)?.label ?? 'Overview';
  const activeFilterCount = activePriorities.length + (searchQuery.trim() ? 1 : 0);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen overflow-hidden bg-slate-100 text-slate-900">
        <div className="flex h-full">
          <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white">
                  TF
                </div>
                <div>
                  <h1 className="text-base font-semibold text-slate-950">TaskFlow Pro</h1>
                  <p className="text-xs text-slate-500">Focused workspace</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1 p-3">
              {VIEW_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      activeView === item.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    )}
                  >
                    <Icon size={17} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 p-3">
              <p className="px-3 text-xs font-semibold uppercase text-slate-500">Projects</p>
              <div className="mt-2 space-y-1">
                {WORKSPACE_PROJECTS.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setActiveProjectId(project.id)}
                    className={cn(
                      'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                      activeProjectId === project.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    )}
                  >
                    <span className="block font-medium">{project.name}</span>
                    <span className={cn('mt-0.5 block truncate text-xs', activeProjectId === project.id ? 'text-slate-300' : 'text-slate-500')}>
                      {project.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-slate-200 p-3">
              <button
                onClick={() => setResetConfirmOpen(true)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                <RotateCcw size={16} />
                Reset sample data
              </button>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="shrink-0 border-b border-slate-200 bg-white">
              <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={activeProjectId}
                      onChange={(event) => setActiveProjectId(event.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-950 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 lg:hidden"
                    >
                      {WORKSPACE_PROJECTS.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <div className="hidden items-center gap-2 lg:flex">
                      <h2 className="text-lg font-semibold text-slate-950">{activeProject?.name}</h2>
                      <ChevronDown size={16} className="text-slate-400" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {activeViewLabel}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">{activeProject?.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[220px] flex-1 lg:flex-none">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search tasks, tags, owners"
                      className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 lg:w-72"
                    />
                  </div>

                  <div className="hidden items-center gap-1 rounded-md border border-slate-200 bg-white p-1 md:flex">
                    <Filter size={15} className="ml-2 text-slate-400" />
                    {PRIORITIES.map((priority) => (
                      <button
                        key={priority}
                        onClick={() => togglePriority(priority)}
                        className={cn(
                          'rounded px-2 py-1.5 text-xs font-semibold capitalize transition-colors',
                          activePriorities.includes(priority)
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                        )}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setAlertsOpen((current) => !current)}
                    className="relative rounded-md border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                    aria-label="Open alerts"
                  >
                    <Bell size={18} />
                    {alerts.length > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                        {alerts.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setAssistantOpen(true)}
                    className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 lg:px-3"
                    aria-label="Open assistant"
                  >
                    <span className="hidden items-center gap-2 text-sm font-medium lg:flex">
                      <Sparkles size={16} />
                      Assistant
                    </span>
                    <Sparkles size={18} className="lg:hidden" />
                  </button>

                  <button
                    onClick={() => openCreateTask()}
                    className="flex h-10 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus size={17} />
                    Add task
                  </button>
                </div>
              </div>

              <div className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
                {VIEW_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={cn(
                        'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                        activeView === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
                      )}
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </header>

            <main className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {visibleTasks.length} visible task{visibleTasks.length === 1 ? '' : 's'}
                    {activeFilterCount > 0 ? ` with ${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}` : ''}
                  </p>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActivePriorities([]);
                    }}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {activeView === 'overview' && (
                <Overview
                  project={activeProject}
                  tasks={visibleTasks}
                  columns={columns}
                  columnOrder={columnOrder}
                  alerts={alerts}
                  onOpenTask={setSelectedTaskId}
                  onViewChange={setActiveView}
                />
              )}

              {activeView === 'board' && (
                <div className="h-[calc(100vh-190px)] min-h-[520px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <KanbanBoard
                    matchesTask={matchesTask}
                    onAddTask={openCreateTask}
                    onAddColumn={() => setColumnDialog({ mode: 'add' })}
                    onRenameColumn={(columnId) => setColumnDialog({ mode: 'rename', columnId })}
                    onDeleteColumn={setDeleteColumnId}
                    onOpenTask={setSelectedTaskId}
                  />
                </div>
              )}

              {activeView === 'list' && (
                <TaskList
                  tasks={visibleTasks}
                  columns={columns}
                  onOpenTask={setSelectedTaskId}
                  onBulkUpdate={handleBulkUpdate}
                  onBulkDelete={setBulkDeleteIds}
                />
              )}

              {activeView === 'timeline' && (
                <TimelineView tasks={visibleTasks} columns={columns} onOpenTask={setSelectedTaskId} />
              )}
            </main>
          </div>

          <AnimatePresence>
            {assistantOpen && (
              <div className="fixed inset-y-0 right-0 z-30 w-full max-w-[420px] lg:relative lg:z-auto">
                <ChatWindow
                  onClose={() => setAssistantOpen(false)}
                  workspaceContext={workspaceContext}
                  suggestions={assistantSuggestions}
                  buildActions={buildAssistantActions}
                  onApplyAction={handleAssistantAction}
                />
              </div>
            )}
          </AnimatePresence>
        </div>

        {alertsOpen && (
          <div className="fixed right-4 top-20 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-lg border border-slate-200 bg-white p-3 shadow-xl lg:right-[calc(1.5rem+0px)]">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-950">Alerts</p>
              <button
                onClick={() => setAlertsOpen(false)}
                className="rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="rounded-md border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-950">{alert.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{alert.detail}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">No urgent alerts right now.</p>
              )}
            </div>
          </div>
        )}

        <AddTaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          defaultColumnId={createColumnId}
          defaultProjectId={activeProjectId}
          onCreated={(title) =>
            pushToast({
              title: 'Task created',
              description: title,
              tone: 'success'
            })
          }
        />

        <TaskDetailDrawer
          task={selectedTask}
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTaskId(null)}
          onRequestDelete={setDeleteTaskId}
          onSaved={(title) =>
            pushToast({
              title: 'Task updated',
              description: title,
              tone: 'success'
            })
          }
          onCommentAdded={(title) =>
            pushToast({
              title: 'Comment added',
              description: title,
              tone: 'success'
            })
          }
        />

        <ColumnDialog
          isOpen={Boolean(columnDialog)}
          mode={columnDialog?.mode ?? 'add'}
          initialTitle={columnDialog?.columnId ? columns[columnDialog.columnId]?.title : ''}
          onClose={() => setColumnDialog(null)}
          onSubmit={handleColumnDialogSubmit}
        />

        <ConfirmDialog
          isOpen={Boolean(deleteColumnTarget)}
          title="Delete section?"
          description={
            deleteColumnTarget
              ? `Tasks in "${deleteColumnTarget.title}" will move to the first remaining section.`
              : ''
          }
          confirmLabel="Delete section"
          onCancel={() => setDeleteColumnId(null)}
          onConfirm={handleConfirmDeleteColumn}
        />

        <ConfirmDialog
          isOpen={Boolean(deleteTaskTarget)}
          title="Delete task?"
          description={
            deleteTaskTarget
              ? `"${deleteTaskTarget.title}" will be removed from this workspace.`
              : ''
          }
          confirmLabel="Delete task"
          onCancel={() => setDeleteTaskId(null)}
          onConfirm={handleConfirmDeleteTask}
        />

        <ConfirmDialog
          isOpen={bulkDeleteTargets.length > 0}
          title="Delete selected tasks?"
          description={`${bulkDeleteTargets.length} selected task${bulkDeleteTargets.length === 1 ? '' : 's'} will be removed from this workspace.`}
          confirmLabel="Delete tasks"
          onCancel={() => setBulkDeleteIds([])}
          onConfirm={handleConfirmBulkDelete}
        />

        <ConfirmDialog
          isOpen={Boolean(pendingAssistantAction)}
          title="Apply assistant action?"
          description={
            pendingAssistantAction
              ? `${pendingAssistantAction.label}. This will change workspace task data.`
              : ''
          }
          confirmLabel="Apply action"
          onCancel={() => setPendingAssistantAction(null)}
          onConfirm={handleConfirmAssistantAction}
        />

        <ConfirmDialog
          isOpen={resetConfirmOpen}
          title="Reset sample workspace?"
          description="This restores the starter tasks and sections for the local workspace."
          confirmLabel="Reset data"
          onCancel={() => setResetConfirmOpen(false)}
          onConfirm={handleConfirmReset}
        />

        <ToastStack
          toasts={toasts}
          onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
        />
      </div>
    </QueryClientProvider>
  );
}
