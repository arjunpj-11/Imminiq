import Groq from 'groq-sdk';
import { env } from '../../../config/env';
import { ServiceError } from '../../../shared/errors/service.error';
import { recordAITokenUsage, type AITokenUsageCategory } from '../ai-token-usage';

export const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export const groqChat = async (
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  model = env.GROQ_DEFAULT_MODEL,
  category: AITokenUsageCategory = 'other',
  options: { maxTokens?: number; temperature?: number } = {}
) => {
  const response = await groq.chat.completions.create({
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? env.GROQ_MAX_TOKENS,
  });

  recordAITokenUsage('Groq', model, category, {
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
    totalTokens: response.usage?.total_tokens,
  });

  const choice = response.choices[0];
  if (choice?.finish_reason === 'length') {
    throw ServiceError.dependencyFailure(
      'AI_RESPONSE_TRUNCATED',
      `Groq ${model} stopped because its output token limit was reached`
    );
  }

  return choice?.message.content ?? null;
};
