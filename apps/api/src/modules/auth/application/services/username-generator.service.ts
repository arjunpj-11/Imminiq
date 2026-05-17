import crypto from 'crypto'

import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'

const collapseRepeatedUnderscores = (
  value: string
): string => {
  let result = ''
  let previousWasUnderscore = false

  for (const character of value) {
    if (character === '_') {
      if (!previousWasUnderscore) {
        result += character
      }

      previousWasUnderscore = true
      continue
    }

    previousWasUnderscore = false
    result += character
  }

  return result
}

const trimOuterUnderscores = (
  value: string
): string => {
  let start = 0
  let end = value.length

  while (start < end && value[start] === '_') {
    start += 1
  }

  while (end > start && value[end - 1] === '_') {
    end -= 1
  }

  return value.slice(start, end)
}

export const generateUniqueUsernameFromSource = async (
  source: string
): Promise<string> => {
  const alphanumericSource =
    source
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '')

  const sanitizedBase =
    trimOuterUnderscores(
      collapseRepeatedUnderscores(alphanumericSource)
    ).slice(0, 24) || 'user'

  const base =
    sanitizedBase.length >= 3
      ? sanitizedBase
      : `${sanitizedBase}user`.slice(0, 24)

  if (!(await authRepository.usernameExists(base))) {
    return base
  }

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const suffix = crypto.randomInt(10, 100000).toString()
    const separator = attempt % 2 === 0 ? '_' : ''
    const maxBaseLength = 30 - separator.length - suffix.length
    const candidateBase = base.slice(0, Math.max(3, maxBaseLength))
    const candidate = `${candidateBase}${separator}${suffix}`

    if (!(await authRepository.usernameExists(candidate))) {
      return candidate
    }
  }

  throw new ApiError(
    500,
    'Could not generate a unique username. Please try again.',
    'USERNAME_GENERATION_FAILED'
  )
}

export const generateRegistrationUsername = async (data: {
  email?: string
  fullName: string
}): Promise<string> => {
  const source = data.email
    ? data.email.split('@')[0]
    : data.fullName

  return generateUniqueUsernameFromSource(source)
}

export const generateUsername = async (
  fullName: string
): Promise<string> => {
  return generateUniqueUsernameFromSource(fullName)
}
