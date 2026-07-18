import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cerebrasChat: vi.fn(),
  gemini31FlashLiteChat: vi.fn(),
  geminiChat: vi.fn(),
  geminiFlashLiteChat: vi.fn(),
  groqChat: vi.fn(),
}));

vi.mock('../../src/infrastructure/ai/clients/cerebras.client', () => ({
  cerebrasChat: mocks.cerebrasChat,
}));

vi.mock('../../src/infrastructure/ai/clients/gemini.client', () => ({
  gemini31FlashLiteChat: mocks.gemini31FlashLiteChat,
  geminiChat: mocks.geminiChat,
  geminiFlashLiteChat: mocks.geminiFlashLiteChat,
}));

vi.mock('../../src/infrastructure/ai/clients/groq.client', () => ({
  groqChat: mocks.groqChat,
}));

import {
  economyAIChatWithFallback,
  economyAIStructuredWithFallback,
  trackerAIChatWithFallback,
} from '../../src/infrastructure/ai/ai-fallback.helper';
import { ServiceError } from '../../src/shared/errors/service.error';

describe('AI model routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('moves ordinary chat from Groq quota failure to low-cost Gemini only', async () => {
    mocks.groqChat.mockRejectedValueOnce(
      Object.assign(new Error('quota exceeded'), { status: 429 })
    );
    mocks.gemini31FlashLiteChat.mockResolvedValueOnce('fallback response');

    const result = await economyAIChatWithFallback([{ role: 'user', content: 'hello' }]);

    expect(result).toBe('fallback response');
    expect(mocks.geminiChat).not.toHaveBeenCalled();
    expect(mocks.geminiFlashLiteChat).not.toHaveBeenCalled();
    expect(mocks.cerebrasChat).not.toHaveBeenCalled();
  });

  it('tries every tracker model in order when each quota is exhausted', async () => {
    const quotaError = Object.assign(new Error('resource_exhausted'), { status: 429 });
    mocks.geminiChat.mockRejectedValueOnce(quotaError);
    mocks.geminiFlashLiteChat.mockRejectedValueOnce(quotaError);
    mocks.gemini31FlashLiteChat.mockRejectedValueOnce(quotaError);
    const structuredCerebras = vi.fn().mockRejectedValueOnce(quotaError);
    mocks.groqChat.mockResolvedValueOnce('{"title":"tracker"}');

    const result = await trackerAIChatWithFallback(
      'make tracker',
      'return json',
      structuredCerebras
    );

    expect(result).toBe('{"title":"tracker"}');
    expect(mocks.geminiChat).toHaveBeenCalledTimes(1);
    expect(mocks.geminiFlashLiteChat).toHaveBeenCalledTimes(1);
    expect(mocks.gemini31FlashLiteChat).toHaveBeenCalledTimes(1);
    expect(structuredCerebras).toHaveBeenCalledTimes(1);
    expect(mocks.groqChat).toHaveBeenCalledWith(
      [
        { role: 'system', content: 'return json' },
        { role: 'user', content: 'make tracker' },
      ],
      'openai/gpt-oss-120b',
      'other',
      { maxTokens: undefined, temperature: undefined }
    );
  });

  it('continues through the full economy chain before failing', async () => {
    const quotaError = Object.assign(new Error('rate limit'), { status: 429 });
    mocks.groqChat.mockRejectedValue(quotaError);
    mocks.gemini31FlashLiteChat.mockRejectedValueOnce(quotaError);
    mocks.cerebrasChat.mockResolvedValueOnce('last provider response');

    const result = await economyAIChatWithFallback(
      [{ role: 'user', content: 'explain closures' }],
      'quality'
    );

    expect(result).toBe('last provider response');
    expect(mocks.groqChat).toHaveBeenCalledTimes(2);
    expect(mocks.gemini31FlashLiteChat).toHaveBeenCalledTimes(1);
    expect(mocks.cerebrasChat).toHaveBeenCalledTimes(1);
  });

  it('continues to the next provider when a configured model no longer exists', async () => {
    mocks.groqChat.mockRejectedValueOnce(
      Object.assign(new Error('Model does not exist or you do not have access to it.'), {
        status: 404,
        code: 'model_not_found',
      })
    );
    mocks.gemini31FlashLiteChat.mockResolvedValueOnce('fallback response');

    const result = await economyAIChatWithFallback([{ role: 'user', content: 'hello' }]);

    expect(result).toBe('fallback response');
    expect(mocks.gemini31FlashLiteChat).toHaveBeenCalledTimes(1);
    expect(mocks.cerebrasChat).not.toHaveBeenCalled();
  });

  it('continues to the next provider when Groq rejects a request above its TPM allowance', async () => {
    mocks.groqChat.mockRejectedValueOnce(
      Object.assign(
        new Error(
          'Request too large for model on tokens per minute (TPM): rate_limit_exceeded'
        ),
        { status: 413 }
      )
    );
    mocks.gemini31FlashLiteChat.mockResolvedValueOnce('fallback response');

    const result = await economyAIChatWithFallback([{ role: 'user', content: 'hello' }]);

    expect(result).toBe('fallback response');
    expect(mocks.gemini31FlashLiteChat).toHaveBeenCalledTimes(1);
  });

  it('falls back when a provider returns text that fails structured validation', async () => {
    mocks.groqChat.mockResolvedValueOnce('plain text instead of JSON');
    mocks.gemini31FlashLiteChat.mockResolvedValueOnce('{"answer":"valid"}');
    const parseResponse = vi.fn((response: string) => {
      if (!response.startsWith('{')) {
        throw ServiceError.dependencyFailure('AI_INVALID_JSON', 'AI returned invalid JSON');
      }
      return JSON.parse(response) as { answer: string };
    });

    const result = await economyAIStructuredWithFallback(
      [{ role: 'user', content: 'return structured data' }],
      parseResponse
    );

    expect(result).toEqual({ answer: 'valid' });
    expect(parseResponse).toHaveBeenCalledTimes(2);
    expect(mocks.geminiChat).not.toHaveBeenCalled();
    expect(mocks.geminiFlashLiteChat).not.toHaveBeenCalled();
  });

  it('returns a safe quota message only after every provider is exhausted', async () => {
    const quotaError = Object.assign(new Error('provider quota exceeded'), { status: 429 });
    mocks.groqChat.mockRejectedValue(quotaError);
    mocks.gemini31FlashLiteChat.mockRejectedValue(quotaError);
    mocks.cerebrasChat.mockRejectedValue(quotaError);

    await expect(
      economyAIChatWithFallback([{ role: 'user', content: 'generate a lesson' }])
    ).rejects.toMatchObject({
      code: 'AI_QUOTA_EXHAUSTED',
      kind: 'dependency-unavailable',
      publicMessage: 'AI generation capacity is temporarily exhausted. Please try again later.',
    });

    expect(mocks.groqChat).toHaveBeenCalledTimes(2);
    expect(mocks.gemini31FlashLiteChat).toHaveBeenCalledTimes(1);
    expect(mocks.cerebrasChat).toHaveBeenCalledTimes(1);
  });

  it('reports repeated invalid structured responses distinctly from outages', async () => {
    mocks.groqChat.mockResolvedValue('not-json');
    mocks.gemini31FlashLiteChat.mockResolvedValue('not-json');
    mocks.cerebrasChat.mockResolvedValue('not-json');

    await expect(
      economyAIStructuredWithFallback(
        [{ role: 'user', content: 'return json' }],
        () => {
          throw ServiceError.dependencyFailure('AI_INVALID_JSON', 'malformed JSON');
        }
      )
    ).rejects.toMatchObject({
      code: 'AI_PROVIDERS_INVALID_RESPONSE',
      kind: 'dependency-failure',
      publicMessage: 'AI generated an invalid response after several attempts. Please try again.',
    });
  });
});
