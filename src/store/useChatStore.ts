import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatSession, Message } from '../types/chat';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isSidebarOpen: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  createNewSession: () => string;
  setCurrentSession: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  deleteSession: (id: string) => void;
  updateSessionTitle: (id: string, title: string) => void;
  clearAllSessions: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isSidebarOpen: true,

      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      createNewSession: () => {
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        }));
        return newSession.id;
      },

      setCurrentSession: (id) => set({ currentSessionId: id }),

      addMessage: (sessionId, message) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [...s.messages, message],
                  updatedAt: Date.now(),
                  title: s.messages.length === 0 && message.role === 'user' 
                    ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
                    : s.title
                }
              : s
          ),
        }));
      },

      deleteSession: (id) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);
          return {
            sessions: newSessions,
            currentSessionId: state.currentSessionId === id 
              ? (newSessions[0]?.id || null) 
              : state.currentSessionId,
          };
        });
      },

      updateSessionTitle: (id, title) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, title, updatedAt: Date.now() } : s
          ),
        }));
      },

      clearAllSessions: () => set({ sessions: [], currentSessionId: null }),
    }),
    {
      name: 'taskflow-chat-storage',
    }
  )
);
