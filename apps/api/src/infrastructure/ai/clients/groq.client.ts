import Groq from 'groq-sdk';
import { env } from '../../../config/env';
import { recordAITokenUsage, type AITokenUsageCategory } from '../ai-token-usage';

export const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export const groqChat = async (
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  model = env.GROQ_DEFAULT_MODEL,
  category: AITokenUsageCategory = 'other'
) => {
  const response = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: env.GROQ_MAX_TOKENS,
  });

  recordAITokenUsage('Groq', model, category, {
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
    totalTokens: response.usage?.total_tokens,
  });

  return response.choices[0].message.content;
};
