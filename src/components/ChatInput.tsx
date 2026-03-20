import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, ArrowUp } from 'lucide-react';
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
    <div className="p-4 max-w-4xl mx-auto w-full">
      <div className="relative bg-brand-surface border border-brand-border rounded-2xl p-2 shadow-2xl focus-within:border-white/20 transition-all">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message TaskFlow AI..."
          className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-sm max-h-[200px] min-h-[44px]"
          rows={1}
        />
        
        <div className="flex items-center justify-between px-2 pb-1">
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-white/5 rounded-lg text-brand-muted hover:text-white transition-all">
              <Paperclip size={18} />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg text-brand-muted hover:text-white transition-all">
              <Mic size={18} />
            </button>
          </div>
          
          <button 
            onClick={handleSend}
            disabled={!content.trim() || isLoading}
            className={cn(
              "p-2 rounded-xl transition-all",
              content.trim() && !isLoading 
                ? "bg-white text-black hover:bg-white/90" 
                : "bg-white/5 text-brand-muted cursor-not-allowed"
            )}
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-center mt-3 text-brand-muted">
        TaskFlow AI can make mistakes. Check important info.
      </p>
    </div>
  );
};
