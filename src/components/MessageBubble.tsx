import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AssistantAction, Message } from '../types/chat';
import { cn } from '../lib/utils';
import { User, Sparkles, Wand2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onApplyAction?: (action: AssistantAction) => void;
}

export const MessageBubble = ({ message, onApplyAction }: MessageBubbleProps) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div 
      className={cn(
        "flex gap-3 border-b border-slate-100 p-5 transition-colors",
        isAssistant ? "bg-slate-50/70" : "bg-white"
      )}
    >
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
        isAssistant ? "bg-blue-50 text-blue-600" : "bg-slate-900 text-white"
      )}>
        {isAssistant ? <Sparkles size={16} /> : <User size={16} />}
      </div>
      
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-[11px] font-semibold uppercase text-slate-500">
          {isAssistant ? "TaskFlow AI" : "You"}
        </p>
        <div className="prose prose-sm max-w-none text-slate-700 prose-p:leading-6 prose-pre:border prose-pre:border-slate-200 prose-pre:bg-slate-950 prose-pre:text-slate-50">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {isAssistant && message.actions && message.actions.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.actions.map((action) => (
              <button
                key={action.id}
                onClick={() => onApplyAction?.(action)}
                className="flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Wand2 size={15} />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-950">{action.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{action.description}</span>
                </span>
                {action.mutates && (
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                    Confirm
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
