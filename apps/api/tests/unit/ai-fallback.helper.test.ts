import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  cerebrasChat: vi.fn(),
  gemini31FlashLiteChat: vi.fn(),
  geminiChat: vi.fn(),
  geminiFlashLiteChat: vi.fn(),
  groqChat: vi.fn(),
}))

vi.mock('../../src/infrastructure/ai/clients/cerebras.client', () => ({
  cerebrasChat: mocks.cerebrasChat,
}))

vi.mock('../../src/infrastructure/ai/clients/gemini.client', () => ({
  gemini31FlashLiteChat: mocks.gemini31FlashLiteChat,
  geminiChat: mocks.geminiChat,
  geminiFlashLiteChat: mocks.geminiFlashLiteChat,
}))

vi.mock('../../src/infrastructure/ai/clients/groq.client', () => ({
  groqChat: mocks.groqChat,
}))

import {
  economyAIChatWithFallback,
  economyAIStructuredWithFallback,
  trackerAIChatWithFallback,
} from '../../src/infrastructure/ai/ai-fallback.helper'

describe('AI model routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('moves ordinary chat from Groq quota failure to low-cost Gemini only', async () => {
    mocks.groqChat.mockRejectedValueOnce(Object.assign(new Error('quota exceeded'), { status: 429 }))
    mocks.gemini31FlashLiteChat.mockResolvedValueOnce('fallback response')

    const result = await economyAIChatWithFallback([
      { role: 'user', content: 'hello' },
    ])

    expect(result).toBe('fallback response')
    expect(mocks.geminiChat).not.toHaveBeenCalled()
    expect(mocks.geminiFlashLiteChat).not.toHaveBeenCalled()
    expect(mocks.cerebrasChat).not.toHaveBeenCalled()
  })

  it('tries every tracker model in order when each quota is exhausted', async () => {
    const quotaError = Object.assign(new Error('resource_exhausted'), { status: 429 })
    mocks.geminiChat.mockRejectedValueOnce(quotaError)
    mocks.geminiFlashLiteChat.mockRejectedValueOnce(quotaError)
    mocks.gemini31FlashLiteChat.mockRejectedValueOnce(quotaError)
    const structuredCerebras = vi.fn().mockRejectedValueOnce(quotaError)
    mocks.groqChat.mockResolvedValueOnce('{"title":"tracker"}')

    const result = await trackerAIChatWithFallback(
      'make tracker',
      'return json',
      structuredCerebras,
    )

    expect(result).toBe('{"title":"tracker"}')
    expect(mocks.geminiChat).toHaveBeenCalledTimes(1)
    expect(mocks.geminiFlashLiteChat).toHaveBeenCalledTimes(1)
    expect(mocks.gemini31FlashLiteChat).toHaveBeenCalledTimes(1)
    expect(structuredCerebras).toHaveBeenCalledTimes(1)
    expect(mocks.groqChat).toHaveBeenCalledWith(
      [
        { role: 'system', content: 'return json' },
        { role: 'user', content: 'make tracker' },
      ],
      'llama-3.3-70b-versatile',
    )
  })

  it('continues through the full economy chain before failing', async () => {
    const quotaError = Object.assign(new Error('rate limit'), { status: 429 })
    mocks.groqChat.mockRejectedValue(quotaError)
    mocks.gemini31FlashLiteChat.mockRejectedValueOnce(quotaError)
    mocks.cerebrasChat.mockResolvedValueOnce('last provider response')

    const result = await economyAIChatWithFallback([
      { role: 'user', content: 'explain closures' },
    ], 'llama-3.3-70b-versatile')

    expect(result).toBe('last provider response')
    expect(mocks.groqChat).toHaveBeenCalledTimes(2)
    expect(mocks.gemini31FlashLiteChat).toHaveBeenCalledTimes(1)
    expect(mocks.cerebrasChat).toHaveBeenCalledTimes(1)
  })

  it('falls back when a provider returns text that fails structured validation', async () => {
    mocks.groqChat.mockResolvedValueOnce('plain text instead of JSON')
    mocks.gemini31FlashLiteChat.mockResolvedValueOnce('{"answer":"valid"}')
    const parseResponse = vi.fn((response: string) => {
      if (!response.startsWith('{')) {
        throw Object.assign(new Error('AI returned invalid JSON'), { statusCode: 502 })
      }
      return JSON.parse(response) as { answer: string }
    })

    const result = await economyAIStructuredWithFallback(
      [{ role: 'user', content: 'return structured data' }],
      parseResponse,
    )

    expect(result).toEqual({ answer: 'valid' })
    expect(parseResponse).toHaveBeenCalledTimes(2)
    expect(mocks.geminiChat).not.toHaveBeenCalled()
    expect(mocks.geminiFlashLiteChat).not.toHaveBeenCalled()
  })
})
