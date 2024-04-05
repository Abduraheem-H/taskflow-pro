import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { useChatStore } from '../store/useChatStore';
import { generateChatResponse } from '../services/gemini';

export const ChatWindow = () => {
  const { sessions, currentSessionId, addMessage, createSession } = useChatStore();
  const currentSession = sessions.find((session) => session.id === currentSessionId);

  const mutation = useMutation({
    mutationFn: async (messages: any[]) => generateChatResponse(messages),
    onSuccess: (response) => {
      if (!currentSessionId) {
        return;
      }
      addMessage(currentSessionId, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      });
    },
  });

  const handleSend = (content: string) => {
    const sessionId = currentSessionId ?? createSession();
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content,
      timestamp: Date.now(),
    };

    addMessage(sessionId, userMessage);
    mutation.mutate([...(currentSession?.messages ?? []), userMessage]);
  };

  return (
    <div className="chat-window">
      <header className="chat-header">Assistant</header>
      <div className="chat-body">
        {!currentSession || currentSession.messages.length === 0 ? (
          <p>Start a conversation.</p>
        ) : (
          currentSession.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
};