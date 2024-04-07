import { GoogleGenAI } from "@google/genai";
import { Message } from "../types/chat";

const apiKey = process.env.GEMINI_API_KEY;

export async function generateChatResponse(messages: Message[]) {
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please configure it in the Secrets panel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Format history for Gemini
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const lastMessage = messages[messages.length - 1].content;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: lastMessage }] }
      ],
      config: {
        systemInstruction: "You are Lumina, a premium AI assistant designed for a high-end workspace. You are helpful, concise, and professional. You support markdown formatting.",
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
