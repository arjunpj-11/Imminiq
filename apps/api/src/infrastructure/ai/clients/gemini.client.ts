import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../../config/env';
import { recordAITokenUsage, type AITokenUsageCategory } from '../ai-token-usage';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

type GeminiModel = string;

export const geminiChatWithModel = async (
  modelName: GeminiModel,
  prompt: string,
  system?: string,
  category: AITokenUsageCategory = 'other'
) => {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: system,
  });

  const result = await model.generateContent(prompt);

  const usage = result.response.usageMetadata;
  recordAITokenUsage('Gemini', modelName, category, {
    promptTokens: usage?.promptTokenCount,
    completionTokens: usage?.candidatesTokenCount,
    totalTokens: usage?.totalTokenCount,
  });

  return result.response.text();
};

export const geminiChat = async (
  prompt: string,
  system?: string,
  category: AITokenUsageCategory = 'other'
) => {
  return geminiChatWithModel(env.GEMINI_DEFAULT_MODEL, prompt, system, category);
};

export const geminiFlashLiteChat = async (
  prompt: string,
  system?: string,
  category: AITokenUsageCategory = 'other'
) => {
  return geminiChatWithModel(env.GEMINI_FAST_MODEL, prompt, system, category);
};

export const gemini31FlashLiteChat = async (
  prompt: string,
  system?: string,
  category: AITokenUsageCategory = 'other'
) => {
  return geminiChatWithModel(env.GEMINI_NEXT_MODEL, prompt, system, category);
};

export const geminiChatWithHistory = async (
  messages: { role: 'user' | 'model'; content: string }[],
  system?: string
) => {
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_HISTORY_MODEL,
    systemInstruction: system,
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });

  const lastMessage = messages[messages.length - 1].content;

  const result = await chat.sendMessage(lastMessage);

  return result.response.text();
};
