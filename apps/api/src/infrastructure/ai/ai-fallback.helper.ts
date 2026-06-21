import {
  gemini31FlashLiteChat,
  geminiChat,
  geminiFlashLiteChat,
} from './clients/gemini.client'

// ============================================================
// AI FALLBACK HELPERS
// ============================================================

export const shouldFallbackFromProvider = (
  error: unknown
): boolean => {
  if (!error || typeof error !== 'object') {
    return false
  }

  const possibleError = error as {
    status?: number
    statusCode?: number
    message?: string
  }

  const message =
    possibleError.message?.toLowerCase() || ''

  return (
    possibleError.status === 429 ||
    possibleError.statusCode === 429 ||
    possibleError.status === 503 ||
    possibleError.statusCode === 503 ||
    possibleError.status === 500 ||
    possibleError.statusCode === 500 ||
    message.includes('429') ||
    message.includes('503') ||
    message.includes('500') ||
    message.includes('resource_exhausted') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('high demand') ||
    message.includes('service unavailable') ||
    message.includes('unavailable') ||
    message.includes('temporarily unavailable') ||
    message.includes('overloaded')
  )
}

export const heavyAIChatWithFallback = async (
  prompt: string,
  system: string,
  cerebrasFallback: (
    prompt: string,
    system?: string
  ) => Promise<string>
): Promise<string> => {
  try {
    return await geminiChat(prompt, system)
  } catch (geminiFlashError) {
    if (!shouldFallbackFromProvider(geminiFlashError)) {
      throw geminiFlashError
    }

    console.warn(
      '⚠️ Gemini 2.5 Flash unavailable or quota-limited. Trying Gemini 2.5 Flash-Lite.'
    )
  }

  try {
    return await geminiFlashLiteChat(prompt, system)
  } catch (geminiFlashLiteError) {
    if (!shouldFallbackFromProvider(geminiFlashLiteError)) {
      throw geminiFlashLiteError
    }

    console.warn(
      '⚠️ Gemini 2.5 Flash-Lite unavailable or quota-limited. Trying Gemini 3.1 Flash-Lite.'
    )
  }

  try {
    return await gemini31FlashLiteChat(prompt, system)
  } catch (gemini31FlashLiteError) {
    if (!shouldFallbackFromProvider(gemini31FlashLiteError)) {
      throw gemini31FlashLiteError
    }

    console.warn(
      '⚠️ Gemini 3.1 Flash-Lite unavailable or quota-limited. Falling back to Cerebras structured output.'
    )
  }

  return cerebrasFallback(prompt, system)
}