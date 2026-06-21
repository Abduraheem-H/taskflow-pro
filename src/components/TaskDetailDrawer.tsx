import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Check, Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { useTaskStore } from '../store/useTaskStore';
import { ChecklistItem, Priority, Task } from '../types/task';
import { WORKSPACE_ASSIGNEES, WORKSPACE_PROJECTS } from '../data/workspace';
import { cn } from '../lib/utils';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestDelete: (taskId: string) => void;
  onSaved?: (title: string) => void;
  onCommentAdded?: (title: string) => void;
}

const priorityOptions: Priority[] = ['low', 'medium', 'high'];

const toDateInputValue = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export const TaskDetailDrawer = ({ task, isOpen, onClose, onRequestDelete, onSaved, onCommentAdded }: TaskDetailDrawerProps) => {
  const { columns, columnOrder, updateTask, addTaskComment } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [projectId, setProjectId] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistInput, setChecklistInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const taskId = task?.id;

  useEffect(() => {
    if (!task || !isOpen) return;

    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setProjectId(task.projectId);
    setAssignee(task.assignee ?? WORKSPACE_ASSIGNEES[0] ?? '');
    setDueDate(toDateInputValue(task.dueDate));
    setTagInput(task.tags.join(', '));
    setChecklist(task.checklist ?? []);
    setChecklistInput('');
    setCommentInput('');
  }, [taskId, isOpen]);

  const checklistProgress = useMemo(() => {
    if (checklist.length === 0) return 0;
    return Math.round((checklist.filter((item) => item.completed).length / checklist.length) * 100);
  }, [checklist]);

  const handleSave = () => {
    if (!task || !title.trim()) return;

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      projectId,
      assignee,
      dueDate: dueDate || undefined,
      tags: tagInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      checklist
    });
    onSaved?.(title.trim());
    onClose();
  };

  const handleAddComment = () => {
    if (!task || !commentInput.trim()) return;
    addTaskComment(task.id, commentInput);
    onCommentAdded?.(task.title);
    setCommentInput('');
  };

  const addChecklistItem = () => {
    const label = checklistInput.trim();
    if (!label) return;

    setChecklist((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        label,
        completed: false
      }
    ]);
    setChecklistInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && task && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/30"
          />

          <motion.aside
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative flex h-full w-full max-w-[480px] flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex min-h-16 items-center justify-between border-b border-slate-200 px-5">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Task details</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Created {format(task.createdAt, 'MMM d, yyyy')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                aria-label="Close task details"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-500">Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-950 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-500">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-md border border-slate-200 px-3 py-2.5 text-sm leading-6 text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Status</label>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  >
                    {columnOrder.map((columnId) => (
                      <option key={columnId} value={columnId}>
                        {columns[columnId]?.title ?? 'Untitled'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Priority</label>
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as Priority)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Project</label>
                  <select
                    value={projectId}
                    onChange={(event) => setProjectId(event.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  >
                    {WORKSPACE_PROJECTS.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Assignee</label>
                  <select
                    value={assignee}
                    onChange={(event) => setAssignee(event.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  >
                    {WORKSPACE_ASSIGNEES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Due date</label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Tags</label>
                  <input
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    placeholder="design, launch"
                    className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-950">Checklist</h4>
                    <p className="text-xs text-slate-500">{checklistProgress}% complete</p>
                  </div>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full bg-blue-600" style={{ width: `${checklistProgress}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 rounded-md bg-white px-2 py-2">
                      <button
                        onClick={() =>
                          setChecklist((items) =>
                            items.map((entry) =>
                              entry.id === item.id ? { ...entry, completed: !entry.completed } : entry
                            )
                          )
                        }
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded border',
                          item.completed ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-transparent'
                        )}
                        aria-label={`Toggle ${item.label}`}
                      >
                        <Check size={13} />
                      </button>
                      <span className={cn('flex-1 text-sm', item.completed ? 'text-slate-400 line-through' : 'text-slate-700')}>
                        {item.label}
                      </span>
                      <button
                        onClick={() => setChecklist((items) => items.filter((entry) => entry.id !== item.id))}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${item.label}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    value={checklistInput}
                    onChange={(event) => setChecklistInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addChecklistItem();
                      }
                    }}
                    placeholder="Add checklist item"
                    className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    onClick={addChecklistItem}
                    className="rounded-md bg-slate-900 px-3 text-white hover:bg-slate-800"
                    aria-label="Add checklist item"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h4 className="text-sm font-semibold text-slate-950">Comments</h4>
                <div className="mt-3 space-y-2">
                  {(task.comments ?? []).length > 0 ? (
                    (task.comments ?? []).map((comment) => (
                      <div key={comment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold text-slate-700">{comment.author}</p>
                          <p className="text-[11px] text-slate-500">{format(comment.createdAt, 'MMM d, h:mm a')}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                      No comments yet.
                    </p>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    value={commentInput}
                    onChange={(event) => setCommentInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddComment();
                      }
                    }}
                    placeholder="Add a comment"
                    className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentInput.trim()}
                    className="rounded-md bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h4 className="text-sm font-semibold text-slate-950">Activity</h4>
                <div className="mt-3 space-y-3">
                  {(task.activity ?? []).slice().reverse().map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                      <div>
                        <p className="text-sm text-slate-700">{activity.label}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{format(activity.createdAt, 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <footer className="flex items-center justify-between border-t border-slate-200 p-5">
              <button
                onClick={() => onRequestDelete(task.id)}
                className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save changes
                </button>
              </div>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
