import { GoogleGenAI } from "@google/genai";

// Initialize the client
// Note: In a real deployment, ensure process.env.API_KEY is set.
// For this demo code to work, we assume the environment provides it.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const streamAgentResponse = async (
  prompt: string,
  systemInstruction: string,
  history: { role: 'user' | 'model'; content: string }[],
  onChunk: (text: string) => void
) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessageStream({ message: prompt });

    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    onChunk("\n[系统提示]: AI 服务暂时不可用，请检查 API Key 或稍后重试。");
  }
};