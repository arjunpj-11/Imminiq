import { z } from 'zod'

import { ApiError } from '../../shared/utils/ApiError'

// ============================================================
// JSON PARSER HELPER
// ============================================================

export const parseAIJson = <T>(
  response: string,
  schema: z.ZodSchema<T>
): T => {
  const cleaned = response
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned)
    return schema.parse(parsed)
  } catch (error) {
    console.error('AI JSON parse failed:', {
      response: cleaned,
      error,
    })

    throw new ApiError(
      502,
      'AI returned invalid JSON',
      'AI_INVALID_JSON'
    )
  }
}