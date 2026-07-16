import { cerebrasChat } from './clients/cerebras.client';
import { gemini31FlashLiteChat, geminiChat, geminiFlashLiteChat } from './clients/gemini.client';
import { groqChat } from './clients/groq.client';
import type { AITokenUsageCategory } from './ai-token-usage';
import { env } from '../../config/env';
import { ServiceError } from '../../shared/errors/service.error';

export type GroqModelTier = 'fast' | 'quality';

export type AIChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type AIProvider<T> = {
  name: string;
  generate: () => Promise<T | null>;
};

type AIFailureReason =
  | 'quota'
  | 'timeout'
  | 'invalid-response'
  | 'authentication'
  | 'unavailable';

type AIFallbackOptions = {
  operation?: string;
  groqMaxTokens?: number;
  temperature?: number;
};

type AIProviderFailure = {
  provider: string;
  reason: AIFailureReason;
  code: string;
  message: string;
};

const errorDetails = (error: unknown) => {
  if (!error || typeof error !== 'object') return null;
  return error as {
    kind?: string;
    status?: number;
    statusCode?: number;
    code?: string | number;
    message?: string;
  };
};

const diagnosticMessage = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
};

const classifyProviderFailure = (error: unknown): AIFailureReason | null => {
  const possibleError = errorDetails(error);
  if (!possibleError) return null;

  const status = possibleError.status ?? possibleError.statusCode;
  const code = String(possibleError.code ?? '').toLowerCase();
  const message = possibleError.message?.toLowerCase() ?? '';

  if (
    status === 429 ||
    message.includes('429') ||
    message.includes('resource_exhausted') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    code.includes('resource_exhausted') ||
    code.includes('rate_limit')
  ) {
    return 'quota';
  }

  if (
    status === 408 ||
    code === 'etimedout' ||
    code === 'econnreset' ||
    code.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('timeout')
  ) {
    return 'timeout';
  }

  if (
    code.startsWith('ai_invalid_') ||
    code === 'ai_response_truncated' ||
    message.includes('empty response') ||
    possibleError.kind === 'dependency-failure'
  ) {
    return 'invalid-response';
  }

  if (
    status === 401 ||
    status === 403 ||
    message.includes('api key') ||
    message.includes('authentication') ||
    message.includes('unauthorized')
  ) {
    return 'authentication';
  }

  if (
    (typeof status === 'number' && status >= 500) ||
    possibleError.kind === 'dependency-unavailable' ||
    message.includes('high demand') ||
    message.includes('service unavailable') ||
    message.includes('temporarily unavailable') ||
    message.includes('overloaded')
  ) {
    return 'unavailable';
  }

  return null;
};

export const shouldFallbackFromProvider = (error: unknown): boolean => {
  return classifyProviderFailure(error) !== null;
};

const exhaustedProviderError = (failures: AIProviderFailure[], cause: unknown): ServiceError => {
  const onlyQuota = failures.every((failure) => failure.reason === 'quota');
  const onlyInvalidResponses = failures.every(
    (failure) => failure.reason === 'invalid-response'
  );
  const details = failures
    .map(
      (failure) =>
        `${failure.provider}: reason=${failure.reason} code=${failure.code} message=${failure.message}`
    )
    .join(' | ');

  if (onlyQuota) {
    return ServiceError.dependencyUnavailable(
      'AI_QUOTA_EXHAUSTED',
      `Every configured AI provider exhausted its quota. ${details}`,
      cause,
      'AI generation capacity is temporarily exhausted. Please try again later.'
    );
  }

  if (onlyInvalidResponses) {
    return ServiceError.dependencyFailure(
      'AI_PROVIDERS_INVALID_RESPONSE',
      `Every configured AI provider returned an invalid response. ${details}`,
      cause,
      'AI generated an invalid response after several attempts. Please try again.'
    );
  }

  return ServiceError.dependencyUnavailable(
    'AI_PROVIDERS_UNAVAILABLE',
    `Every configured AI provider failed. ${details}`,
    cause,
    'AI services are temporarily unavailable. Please try again later.'
  );
};

const runFallbackChain = async <T>(
  providers: AIProvider<T>[],
  operation = 'ai-generation'
): Promise<T> => {
  let lastError: unknown;
  const failures: AIProviderFailure[] = [];

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
      const reason = classifyProviderFailure(error);
      if (!reason) throw error;

      const possibleError = errorDetails(error);
      const failure: AIProviderFailure = {
        provider: provider.name,
        reason,
        code: String(possibleError?.code ?? possibleError?.status ?? possibleError?.statusCode ?? 'n/a'),
        message: diagnosticMessage(error),
      };
      failures.push(failure);

      const hasFallback = index < providers.length - 1;
      const nextProvider = hasFallback ? providers[index + 1].name : 'none';
      console.warn(
        `[AI fallback] operation=${operation} attempt=${index + 1}/${providers.length} ` +
          `provider="${provider.name}" reason=${reason} code=${failure.code} ` +
          `message="${failure.message}" next="${nextProvider}"`
      );
      if (!hasFallback) break;
    }
  }

  const exhaustedError = exhaustedProviderError(failures, lastError);
  console.error(
    `[AI exhausted] operation=${operation} code=${exhaustedError.code} providers=${failures.length}`
  );
  throw exhaustedError;
};

export const getAIUserMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'publicMessage' in error) {
    const publicMessage = (error as { publicMessage?: unknown }).publicMessage;
    if (typeof publicMessage === 'string' && publicMessage.trim()) return publicMessage;
  }
  return 'AI generation could not be completed. Please try again later.';
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
  category: AITokenUsageCategory,
  options: AIFallbackOptions
): AIProvider<string>[] => {
  const primaryModel = primaryGroqModel === 'fast' ? env.GROQ_FAST_MODEL : env.GROQ_DEFAULT_MODEL;
  const alternateGroqModel =
    primaryGroqModel === 'fast' ? env.GROQ_DEFAULT_MODEL : env.GROQ_FAST_MODEL;
  const { prompt, system } = toPrompt(messages);

  return [
    {
      name: `Groq ${primaryModel}`,
      generate: () =>
        groqChat(messages, primaryModel, category, {
          maxTokens: options.groqMaxTokens,
          temperature: options.temperature,
        }),
    },
    {
      name: 'Gemini 3.1 Flash-Lite',
      generate: () => gemini31FlashLiteChat(prompt, system, category),
    },
    {
      name: `Groq ${alternateGroqModel}`,
      generate: () =>
        groqChat(messages, alternateGroqModel, category, {
          maxTokens: options.groqMaxTokens,
          temperature: options.temperature,
        }),
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
  category: AITokenUsageCategory = 'other',
  options: AIFallbackOptions = {}
): Promise<string> => {
  return runFallbackChain(
    getEconomyProviders(messages, primaryGroqModel, category, options),
    options.operation
  );
};

/** Validates each model response before accepting it, so invalid JSON/schema
 * output falls through to the next economical model instead of causing a 502. */
export const economyAIStructuredWithFallback = async <T>(
  messages: AIChatMessage[],
  parseResponse: (response: string) => T,
  primaryGroqModel: GroqModelTier = 'fast',
  category: AITokenUsageCategory = 'other',
  options: AIFallbackOptions = {}
): Promise<T> =>
  runFallbackChain(
    getEconomyProviders(messages, primaryGroqModel, category, options).map((provider) => ({
      name: provider.name,
      generate: async () => {
        const response = await provider.generate();
        if (!response?.trim()) {
          throw new Error(`${provider.name} returned an empty response`);
        }
        return parseResponse(response);
      },
    })),
    options.operation
  );

const getTrackerProviders = (
  prompt: string,
  system: string,
  cerebrasStructuredFallback: (
    prompt: string,
    system?: string,
    category?: AITokenUsageCategory
  ) => Promise<string>,
  category: AITokenUsageCategory,
  options: AIFallbackOptions
): AIProvider<string>[] => [
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
        category,
        { maxTokens: options.groqMaxTokens, temperature: options.temperature }
      ),
  },
];

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
  category: AITokenUsageCategory = 'other',
  options: AIFallbackOptions = {}
): Promise<string> =>
  runFallbackChain(
    getTrackerProviders(prompt, system, cerebrasStructuredFallback, category, options),
    options.operation
  );

export const trackerAIStructuredWithFallback = async <T>(
  prompt: string,
  system: string,
  cerebrasStructuredFallback: (
    prompt: string,
    system?: string,
    category?: AITokenUsageCategory
  ) => Promise<string>,
  parseResponse: (response: string) => T,
  category: AITokenUsageCategory = 'other',
  options: AIFallbackOptions = {}
): Promise<T> =>
  runFallbackChain(
    getTrackerProviders(prompt, system, cerebrasStructuredFallback, category, options).map(
      (provider) => ({
        name: provider.name,
        generate: async () => parseResponse((await provider.generate()) ?? ''),
      })
    ),
    options.operation
  );

// Backwards-compatible name for tracker-only callers.
export const heavyAIChatWithFallback = trackerAIChatWithFallback;
