import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatSession, Message } from '../types/chat';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  addMessage: (sessionId: string, message: Message) => void;
  createSession: () => string;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      sessions: [],
      currentSessionId: null,
      addMessage: (sessionId, message) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, message],
                  updatedAt: Date.now(),
                }
              : session,
          ),
        }));
      },
      createSession: () => {
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
    }),
    {
      name: 'taskflow-chat',
    },
  ),
);