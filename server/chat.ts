import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatPayload {
  messages?: ChatMessage[];
  workspaceContext?: string;
}

export class ChatApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

const readEnvFile = (fileName: string) => {
  const filePath = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return {};
  return dotenv.parse(fs.readFileSync(filePath));
};

const getGeminiApiKey = () => {
  const envLocals = readEnvFile('.env.locals');
  const envLocal = readEnvFile('.env.local');
  const env = readEnvFile('.env');
  return envLocals.GEMINI_API_KEY ?? envLocal.GEMINI_API_KEY ?? env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
};

const validateMessages = (messages: unknown): ChatMessage[] => {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ChatApiError('Send at least one message before asking the assistant.', 400);
  }

  return messages.map((message) => {
    const candidate = message as Partial<ChatMessage>;
    if ((candidate.role !== 'user' && candidate.role !== 'assistant') || typeof candidate.content !== 'string') {
      throw new ChatApiError('Invalid chat message payload.', 400);
    }

    return {
      role: candidate.role,
      content: candidate.content.slice(0, 8000)
    };
  });
};

export const createChatResponse = async (payload: ChatPayload) => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new ChatApiError('Gemini API key is missing on the server. Add GEMINI_API_KEY to .env.locals.', 503);
  }

  const messages = validateMessages(payload.messages);
  const history = messages.slice(0, -1).map((message) => ({
    role: message.role === 'user' ? 'user' : 'model',
    parts: [{ text: message.content }]
  }));
  const lastMessage = messages[messages.length - 1].content;
  const workspaceContext = typeof payload.workspaceContext === 'string'
    ? payload.workspaceContext.slice(0, 12000)
    : '';

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...history,
      { role: 'user', parts: [{ text: lastMessage }] }
    ],
    config: {
      systemInstruction: [
        'You are TaskFlow AI, a workspace assistant inside a project management app.',
        'Keep answers practical, concise, and tied to tasks, projects, deadlines, priorities, and statuses.',
        'You may suggest edits, plans, summaries, and task breakdowns, but you cannot directly change task data.',
        'Use markdown formatting when it improves scanability.',
        workspaceContext ? `Current workspace context:\n${workspaceContext}` : ''
      ].filter(Boolean).join('\n\n')
    }
  });

  return {
    content: response.text || "I couldn't generate a response."
  };
};
