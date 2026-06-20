import React from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone?: 'success' | 'info';
}

interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastStack = ({ toasts, onDismiss }: ToastStackProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = toast.tone === 'success' ? CheckCircle2 : Info;
        return (
          <div
            key={toast.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
          >
            <div className="flex gap-3">
              <div
                className={cn(
                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                  toast.tone === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                )}
              >
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-sm leading-5 text-slate-500">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
