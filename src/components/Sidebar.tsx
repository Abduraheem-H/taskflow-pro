import React from 'react';
import { useChatStore } from '../store/useChatStore';
import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export const Sidebar = () => {
  const { 
    sessions, 
    currentSessionId, 
    isSidebarOpen, 
    setSidebarOpen, 
    createNewSession, 
    setCurrentSession,
    deleteSession,
    clearAllSessions
  } = useChatStore();

  return (
    <div 
      className={cn(
        "h-screen bg-brand-surface border-r border-brand-border transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-72" : "w-0 overflow-hidden border-none"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Lumina</h1>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      <div className="px-4 mb-4">
        <button 
          onClick={() => createNewSession()}
          className="w-full flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {sessions.map((session) => (
          <div 
            key={session.id}
            className={cn(
              "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
              currentSessionId === session.id 
                ? "bg-white/10 text-white" 
                : "text-brand-muted hover:bg-white/5 hover:text-white"
            )}
            onClick={() => setCurrentSession(session.id)}
          >
            <MessageSquare size={16} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.title}</p>
              <p className="text-[10px] opacity-50">
                {format(session.updatedAt, 'MMM d, h:mm a')}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteSession(session.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-brand-border space-y-4">
        <button 
          onClick={() => {
            if (confirm("Are you sure you want to clear all chat history?")) {
              clearAllSessions();
            }
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <Trash2 size={14} />
          <span>Clear All History</span>
        </button>
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User Account</p>
            <p className="text-xs text-brand-muted truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};
