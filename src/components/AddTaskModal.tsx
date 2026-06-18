import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Priority } from '../types/task';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TASK_TEMPLATES, WORKSPACE_ASSIGNEES, WORKSPACE_PROJECTS } from '../data/workspace';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultColumnId?: string | null;
  defaultProjectId?: string | null;
  onCreated?: (title: string) => void;
}

const defaultAssignee = WORKSPACE_ASSIGNEES[0] ?? 'You';

export const AddTaskModal = ({
  isOpen,
  onClose,
  defaultColumnId,
  defaultProjectId,
  onCreated
}: AddTaskModalProps) => {
  const { addTask, columns, columnOrder } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [columnId, setColumnId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignee, setAssignee] = useState(defaultAssignee);
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [checklist, setChecklist] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const fallbackColumn = defaultColumnId ?? columnOrder[0] ?? '';
    const fallbackProject = defaultProjectId ?? WORKSPACE_PROJECTS[0]?.id ?? '';

    setColumnId(fallbackColumn);
    setProjectId(fallbackProject);
    setAssignee(defaultAssignee);
    setDueDate('');
    setTagInput('');
    setTemplateId('');
    setChecklist([]);
  }, [isOpen, defaultColumnId, defaultProjectId, columnOrder]);

  const handleTemplateSelect = (nextTemplateId: string) => {
    setTemplateId(nextTemplateId);
    const template = TASK_TEMPLATES.find((item) => item.id === nextTemplateId);
    if (!template) return;

    setTitle(template.title);
    setDescription(template.taskDescription);
    setPriority(template.priority);
    setTagInput(template.tags.join(', '));
    setChecklist(template.checklist);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && columnId && projectId) {
      const tags = tagInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      const checklistItems = checklist.map((label) => ({
        id: crypto.randomUUID(),
        label,
        completed: false
      }));

      addTask(columnId, title.trim(), description.trim(), priority, assignee, dueDate || undefined, projectId, tags, checklistItems);
      onCreated?.(title.trim());
      setTitle('');
      setDescription('');
      setPriority('medium');
      setTagInput('');
      setTemplateId('');
      setChecklist([]);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Create task</h3>
                <p className="mt-1 text-sm text-slate-500">Add work to the active project and section.</p>
              </div>
              <button onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950" aria-label="Close create task modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-500">Template</label>
                <select
                  value={templateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Start from blank</option>
                  {TASK_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {templateId && (
                  <p className="text-xs leading-5 text-slate-500">
                    {TASK_TEMPLATES.find((template) => template.id === templateId)?.description}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-500">Title</label>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-500">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add some details..."
                  rows={3}
                  className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  >
                    {WORKSPACE_PROJECTS.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Section</label>
                  <select
                    value={columnId}
                    onChange={(e) => setColumnId(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  >
                    {columnOrder.map((id) => (
                      <option key={id} value={id}>
                        {columns[id]?.title ?? 'Untitled'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Assignee</label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  >
                    {WORKSPACE_ASSIGNEES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Due date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-500">Tags</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="design, launch, follow-up"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-500">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 rounded-md border py-2 text-xs font-bold uppercase transition-all ${
                        priority === p 
                          ? 'border-slate-950 bg-slate-950 text-white' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!title.trim() || !columnId || !projectId}
                  className="w-full rounded-md bg-blue-600 py-3 font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
