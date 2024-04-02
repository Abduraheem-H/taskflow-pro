import React, { useState } from 'react';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { Message } from '../types/chat';

export const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="chat-window">
      <header className="chat-header">Assistant</header>
      <div className="chat-body">
        {messages.length === 0 ? (
          <p>Start a conversation.</p>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
};