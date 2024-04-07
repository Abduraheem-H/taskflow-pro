import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { generateChatResponse } from '../services/gemini';
import { useMutation } from '@tanstack/react-query';
import { PanelLeftOpen, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const ChatWindow = () => {
  const { 
    sessions, 
    currentSessionId, 
    addMessage, 
    isSidebarOpen, 
    setSidebarOpen,
    createNewSession 
  } = useChatStore();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const currentSession = sessions.find(s => s.id === currentSessionId);

  const mutation = useMutation({
    mutationFn: async (messages: any[]) => {
      return await generateChatResponse(messages);
    },
    onSuccess: (data) => {
      if (currentSessionId) {
        addMessage(currentSessionId, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data,
          timestamp: Date.now()
        });
      }
    },
    onError: (error: any) => {
      if (currentSessionId) {
        addMessage(currentSessionId, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `**Error:** ${error.message || "Failed to generate response. Please check your API key and connection."}`,
          timestamp: Date.now()
        });
      }
    }
  });

  const handleSend = async (content: string) => {
    let sessionId = currentSessionId;
    
    if (!sessionId) {
      sessionId = createNewSession();
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content,
      timestamp: Date.now()
    };

    addMessage(sessionId, userMessage);
    
    const updatedMessages = [...(currentSession?.messages || []), userMessage];
    mutation.mutate(updatedMessages);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages, mutation.isPending]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-brand-bg relative overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-brand-border flex items-center px-6 justify-between bg-brand-bg/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          {!isSidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
          <h2 className="text-sm font-medium opacity-80">
            {currentSession?.title || "New Chat"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-medium tracking-wider uppercase opacity-60">
            Gemini 3 Flash
          </div>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        {!currentSession || currentSession.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10"
            >
              <Sparkles size={32} className="text-white" />
            </motion.div>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-semibold tracking-tight mb-2"
            >
              How can I help you today?
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-brand-muted max-w-md text-sm leading-relaxed"
            >
              Lumina is your premium AI workspace. Ask questions, generate content, or explore ideas with the power of Gemini.
            </motion.p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-12 w-full max-w-2xl">
              {[
                "Write a professional email for a job application",
                "Explain quantum computing in simple terms",
                "Create a 7-day workout plan for beginners",
                "Help me debug a React useEffect loop"
              ].map((suggestion, i) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  onClick={() => handleSend(suggestion)}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left text-xs hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full py-4">
            {currentSession.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {mutation.isPending && (
              <div className="flex gap-4 p-6 bg-white/[0.02]">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles size={16} />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="h-2 w-24 bg-white/10 rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
                    <div className="h-2 w-3/4 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-gradient-to-t from-brand-bg via-brand-bg to-transparent pt-12">
        <ChatInput onSend={handleSend} isLoading={mutation.isPending} />
      </div>
    </div>
  );
};
