import { GoogleGenAI } from '@google/genai';
import { Message } from '../types/chat';

const apiKey = process.env.GEMINI_API_KEY;

export async function generateChatResponse(messages: Message[]) {
  if (!apiKey) {
    throw new Error('Gemini API key is missing.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const lastMessage = messages[messages.length - 1]?.content ?? '';

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: lastMessage }] }],
  });

  return response.text || 'Sorry, I was unable to respond.';
}