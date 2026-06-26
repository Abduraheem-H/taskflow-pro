import React, { useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { generateChatResponse } from "../services/gemini";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { Message } from "../types/chat";

interface ChatWindowProps {
  onClose?: () => void;
  workspaceContext?: string;
  suggestions?: string[];
}

type ChatRequest = {
  sessionId: string;
  messages: Message[];
};

const DEFAULT_SUGGESTIONS = [
  "Summarize what needs attention this week.",
  "Break the highest priority task into next steps.",
  "Draft a concise project status update.",
  "Suggest what I should do first today."
];

export const ChatWindow = ({ onClose, workspaceContext, suggestions = DEFAULT_SUGGESTIONS }: ChatWindowProps) => {
  const {
    sessions,
    currentSessionId,
    addMessage,
    createNewSession,
  } = useChatStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const mutation = useMutation({
    mutationFn: async ({ messages }: ChatRequest) => {
      return await generateChatResponse(messages, workspaceContext);
    },
    onSuccess: (data, variables) => {
      if (variables.sessionId) {
        addMessage(variables.sessionId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data,
          timestamp: Date.now(),
        });
      }
    },
    onError: (error: any, variables) => {
      if (variables.sessionId) {
        addMessage(variables.sessionId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `**Error:** ${error.message || "Failed to generate response. Please check your API key and connection."}`,
          timestamp: Date.now(),
        });
      }
    },
  });

  const handleSend = async (content: string) => {
    let sessionId = currentSessionId;

    if (!sessionId) {
      sessionId = createNewSession();
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content,
      timestamp: Date.now(),
    };

    addMessage(sessionId, userMessage);

    const sessionMessages = sessions.find((session) => session.id === sessionId)?.messages ?? currentSession?.messages ?? [];
    const updatedMessages = [...sessionMessages, userMessage];
    mutation.mutate({ sessionId, messages: updatedMessages });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages, mutation.isPending]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex h-full w-full flex-col overflow-hidden border-l border-slate-200 bg-white shadow-xl lg:w-[420px]"
    >
      <header className="flex min-h-16 items-center justify-between border-b border-slate-200 px-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Sparkles size={16} className="text-blue-600" />
            TaskFlow Assistant
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {currentSession?.title || "Workspace guidance"}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close assistant"
          >
            <X size={18} />
          </button>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
        {!currentSession || currentSession.messages.length === 0 ? (
          <div className="flex h-full flex-col justify-center p-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50"
            >
              <Sparkles size={20} className="text-blue-600" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg font-semibold text-slate-950"
            >
              Ask about this workspace
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2 max-w-sm text-sm leading-6 text-slate-600"
            >
              Use the assistant for status updates, task breakdowns, prioritization, and planning notes.
            </motion.p>

            <div className="mt-6 grid gap-2">
              {suggestions.map((suggestion, i) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  onClick={() => handleSend(suggestion)}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full py-2">
            {currentSession.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {mutation.isPending && (
              <div className="flex gap-3 border-t border-slate-100 p-5">
                <div className="flex h-8 w-8 shrink-0 animate-pulse items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Sparkles size={16} />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="h-2 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-2 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-2 w-3/4 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white">
        <ChatInput onSend={handleSend} isLoading={mutation.isPending} />
      </div>
    </motion.div>
  );
};
