import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSend: (content: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (content.trim() && !isLoading) {
      onSend(content.trim());
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  return (
    <div className="w-full p-4">
      <div className="relative rounded-lg border border-slate-200 bg-slate-50 p-2 shadow-sm transition-all focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask for a status update, next steps, or planning help..."
          className="max-h-[160px] min-h-[44px] w-full resize-none border-none bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          rows={1}
        />
        
        <div className="flex items-center justify-between px-2 pb-1">
          <p className="text-[11px] text-slate-500">Advisory only. Review before acting.</p>
          <button 
            onClick={handleSend}
            disabled={!content.trim() || isLoading}
            className={cn(
              "rounded-md p-2 transition-all",
              content.trim() && !isLoading 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            )}
            aria-label="Send message"
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
