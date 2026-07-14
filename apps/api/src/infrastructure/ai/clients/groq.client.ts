import Groq from 'groq-sdk';
import { env } from '../../../config/env';
import { recordAITokenUsage, type AITokenUsageCategory } from '../ai-token-usage';

export const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export const groqChat = async (
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  model = 'llama-3.3-70b-versatile',
  category: AITokenUsageCategory = 'other'
) => {
  const response = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  });

  recordAITokenUsage('Groq', model, category, {
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
    totalTokens: response.usage?.total_tokens,
  });

  return response.choices[0].message.content;
};
