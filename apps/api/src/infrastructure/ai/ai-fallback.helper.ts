import { cerebrasChat } from './clients/cerebras.client';
import { gemini31FlashLiteChat, geminiChat, geminiFlashLiteChat } from './clients/gemini.client';
import { groqChat } from './clients/groq.client';
import type { AITokenUsageCategory } from './ai-token-usage';
import { env } from '../../config/env';

export type GroqModelTier = 'fast' | 'quality';

export type AIChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type AIProvider<T> = {
  name: string;
  generate: () => Promise<T | null>;
};

export const shouldFallbackFromProvider = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;

  const possibleError = error as {
    status?: number;
    statusCode?: number;
    code?: string | number;
    message?: string;
  };
  const status = possibleError.status ?? possibleError.statusCode;
  const message = possibleError.message?.toLowerCase() || '';

  return (
    status === 408 ||
    status === 429 ||
    (typeof status === 'number' && status >= 500) ||
    possibleError.code === 'ETIMEDOUT' ||
    possibleError.code === 'ECONNRESET' ||
    message.includes('429') ||
    message.includes('resource_exhausted') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('high demand') ||
    message.includes('service unavailable') ||
    message.includes('temporarily unavailable') ||
    message.includes('overloaded') ||
    message.includes('timed out') ||
    message.includes('timeout') ||
    message.includes('empty response')
  );
};

const runFallbackChain = async <T>(providers: AIProvider<T>[]): Promise<T> => {
  let lastError: unknown;

  for (const [index, provider] of providers.entries()) {
    try {
      const response = await provider.generate();
      if (response === null || response === undefined) {
        throw new Error(`${provider.name} returned an empty response`);
      }
      if (typeof response === 'string' && !response.trim()) {
        throw new Error(`${provider.name} returned an empty response`);
      }
      return response;
    } catch (error) {
      lastError = error;
      const hasFallback = index < providers.length - 1;
      if (!hasFallback || !shouldFallbackFromProvider(error)) throw error;
      console.warn(
        `[AI fallback] ${provider.name} is unavailable; trying ${providers[index + 1].name}.`
      );
    }
  }

  throw lastError ?? new Error('No AI provider was available');
};

const toPrompt = (messages: AIChatMessage[]) => {
  const system =
    messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content)
      .join('\n\n') || undefined;
  const prompt = messages
    .filter((message) => message.role !== 'system')
    .map((message) => `${message.role === 'assistant' ? 'Assistant' : 'User'}: ${message.content}`)
    .join('\n\n');

  return { prompt, system };
};

const getEconomyProviders = (
  messages: AIChatMessage[],
  primaryGroqModel: GroqModelTier,
  category: AITokenUsageCategory
): AIProvider<string>[] => {
  const primaryModel =
    primaryGroqModel === 'fast' ? env.GROQ_FAST_MODEL : env.GROQ_DEFAULT_MODEL;
  const alternateGroqModel =
    primaryGroqModel === 'fast' ? env.GROQ_DEFAULT_MODEL : env.GROQ_FAST_MODEL;
  const { prompt, system } = toPrompt(messages);

  return [
    {
      name: `Groq ${primaryModel}`,
      generate: () => groqChat(messages, primaryModel, category),
    },
    {
      name: 'Gemini 3.1 Flash-Lite',
      generate: () => gemini31FlashLiteChat(prompt, system, category),
    },
    {
      name: `Groq ${alternateGroqModel}`,
      generate: () => groqChat(messages, alternateGroqModel, category),
    },
    { name: 'Cerebras Qwen 3', generate: () => cerebrasChat(prompt, system, category) },
  ];
};

/**
 * For chat, lessons, tests, insights, verification, and other non-tracker work.
 * The two premium Gemini models are deliberately absent from this chain.
 */
export const economyAIChatWithFallback = async (
  messages: AIChatMessage[],
  primaryGroqModel: GroqModelTier = 'fast',
  category: AITokenUsageCategory = 'other'
): Promise<string> => {
  return runFallbackChain(getEconomyProviders(messages, primaryGroqModel, category));
};

/** Validates each model response before accepting it, so invalid JSON/schema
 * output falls through to the next economical model instead of causing a 502. */
export const economyAIStructuredWithFallback = async <T>(
  messages: AIChatMessage[],
  parseResponse: (response: string) => T,
  primaryGroqModel: GroqModelTier = 'fast',
  category: AITokenUsageCategory = 'other'
): Promise<T> =>
  runFallbackChain(
    getEconomyProviders(messages, primaryGroqModel, category).map((provider) => ({
      name: provider.name,
      generate: async () => {
        const response = await provider.generate();
        if (!response?.trim()) {
          throw new Error(`${provider.name} returned an empty response`);
        }
        return parseResponse(response);
      },
    }))
  );

/**
 * Reserved for creating/evaluating tracker roadmaps. It exhausts all five
 * configured model options before reporting a quota/provider failure.
 */
export const trackerAIChatWithFallback = async (
  prompt: string,
  system: string,
  cerebrasStructuredFallback: (
    prompt: string,
    system?: string,
    category?: AITokenUsageCategory
  ) => Promise<string>,
  category: AITokenUsageCategory = 'other'
): Promise<string> =>
  runFallbackChain([
    { name: 'Gemini 2.5 Flash', generate: () => geminiChat(prompt, system, category) },
    {
      name: 'Gemini 2.5 Flash-Lite',
      generate: () => geminiFlashLiteChat(prompt, system, category),
    },
    {
      name: 'Gemini 3.1 Flash-Lite',
      generate: () => gemini31FlashLiteChat(prompt, system, category),
    },
    {
      name: 'Cerebras Qwen 3',
      generate: () => cerebrasStructuredFallback(prompt, system, category),
    },
    {
      name: 'Groq Llama 3.3 70B',
      generate: () =>
        groqChat(
          [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
          env.GROQ_DEFAULT_MODEL,
          category
        ),
    },
  ]);

// Backwards-compatible name for tracker-only callers.
export const heavyAIChatWithFallback = trackerAIChatWithFallback;
