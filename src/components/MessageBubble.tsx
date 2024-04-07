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
        "flex gap-4 p-6 transition-colors",
        isAssistant ? "bg-white/[0.02]" : "bg-transparent"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
        isAssistant ? "bg-white/10 text-white" : "bg-white text-black"
      )}>
        {isAssistant ? <Sparkles size={16} /> : <User size={16} />}
      </div>
      
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-40">
          {isAssistant ? "Lumina AI" : "You"}
        </p>
        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
