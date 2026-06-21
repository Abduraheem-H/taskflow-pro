import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat';
import { cn } from '../lib/utils';
import { User, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
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
      </div>
    </div>
  );
};
