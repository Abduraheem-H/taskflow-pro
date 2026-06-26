import { GoogleGenAI } from "@google/genai";
import { Message } from "../types/chat";

const apiKey = process.env.GEMINI_API_KEY;

export async function generateChatResponse(messages: Message[], workspaceContext?: string) {
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
        systemInstruction: [
          "You are TaskFlow AI, a workspace assistant inside a project management app.",
          "Keep answers practical, concise, and tied to the user's tasks, projects, deadlines, priorities, and statuses.",
          "You may suggest edits, plans, summaries, and task breakdowns, but you cannot directly change task data.",
          "Use markdown formatting when it improves scanability.",
          workspaceContext ? `Current workspace context:\n${workspaceContext}` : ""
        ].filter(Boolean).join("\n\n"),
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
