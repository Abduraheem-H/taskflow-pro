import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Priority } from '../types/task';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskModal = ({ isOpen, onClose }: AddTaskModalProps) => {
  const { addTask } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addTask('todo', title, description, priority);
      setTitle('');
      setDescription('');
      setPriority('medium');
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold tracking-tight">Create New Task</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-brand-muted">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-40">Title</label>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-40">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add some details..."
                  rows={3}
                  className="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/20 transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-40">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                        priority === p 
                          ? 'bg-white text-black border-white' 
                          : 'bg-white/5 border-brand-border text-brand-muted hover:bg-white/10'
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
                  disabled={!title.trim()}
                  className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
