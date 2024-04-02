import React from 'react';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={isAssistant ? 'message assistant' : 'message user'}>
      <strong>{isAssistant ? 'Assistant' : 'You'}</strong>
      <p>{message.content}</p>
    </div>
  );
};