import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ColumnDialogProps {
  isOpen: boolean;
  mode: 'add' | 'rename';
  initialTitle?: string;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export const ColumnDialog = ({ isOpen, mode, initialTitle = '', onClose, onSubmit }: ColumnDialogProps) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialTitle);
  }, [isOpen, initialTitle]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    onSubmit(nextTitle);
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
          <motion.form
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            onSubmit={handleSubmit}
            className="relative w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  {mode === 'add' ? 'Add section' : 'Rename section'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Sections organize the workflow lanes on your board.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                aria-label="Close section dialog"
              >
                <X size={18} />
              </button>
            </div>

            <label className="text-xs font-semibold uppercase text-slate-500">Section name</label>
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: Ready for design"
              className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mode === 'add' ? 'Add section' : 'Save name'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
};
