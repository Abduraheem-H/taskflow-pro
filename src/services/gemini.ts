import { Message } from '../types/chat';

interface ChatApiResponse {
  content?: string;
  error?: string;
}

export async function generateChatResponse(messages: Message[], workspaceContext?: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content
      })),
      workspaceContext
    })
  });

  const data = (await response.json().catch(() => ({}))) as ChatApiResponse;

  if (!response.ok) {
    throw new Error(data.error || 'Assistant request failed. Please try again.');
  }

  return data.content || "I couldn't generate a response.";
}
