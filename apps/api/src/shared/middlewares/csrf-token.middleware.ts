import {
  randomBytes,
  timingSafeEqual,
} from 'crypto'
import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import { env } from '../../config/env'
import { ApiError } from '../utils/ApiError'

export const CSRF_COOKIE_NAME = 'csrfToken'

const COOKIE_AUTH_NAMES = [
  'refreshToken',
  'twoFactorChallengeToken',
] as const

const UNSAFE_METHODS = new Set([
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
])

const isProduction = env.NODE_ENV === 'production'

export const CSRF_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: isProduction,
  sameSite: isProduction ? 'none' as const : 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
}

export const createCsrfToken = (): string => {
  return randomBytes(32).toString('hex')
}

export const setCsrfCookie = (
  res: Response,
  csrfToken = createCsrfToken()
): string => {
  res.cookie(
    CSRF_COOKIE_NAME,
    csrfToken,
    CSRF_COOKIE_OPTIONS
  )

  return csrfToken
}

export const clearCsrfCookie = (
  res: Response
): void => {
  res.clearCookie(
    CSRF_COOKIE_NAME,
    CSRF_COOKIE_OPTIONS
  )
}

const hasCookieAuthenticatedCredential = (
  req: Request
): boolean => {
  return COOKIE_AUTH_NAMES.some((cookieName) => {
    return typeof req.cookies?.[cookieName] === 'string'
  })
}

const readCsrfHeader = (
  req: Request
): string => {
  const csrfHeader = req.get('x-csrf-token')

  return typeof csrfHeader === 'string'
    ? csrfHeader
    : ''
}

const readCsrfCookie = (
  req: Request
): string => {
  const csrfCookie = req.cookies?.csrfToken

  return typeof csrfCookie === 'string'
    ? csrfCookie
    : ''
}

const safeEquals = (
  left: string,
  right: string
): boolean => {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

/**
 * Double-submit CSRF validation for cookie-authenticated flows.
 *
 * Only requests that actually carry auth cookies require the X-CSRF-Token
 * header. Pure Bearer-token routes remain usable without a CSRF header.
 */
export const validateCsrfToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!UNSAFE_METHODS.has(req.method.toUpperCase())) {
    next()
    return
  }

  if (!hasCookieAuthenticatedCredential(req)) {
    next()
    return
  }

  const csrfCookie = readCsrfCookie(req)
  const csrfHeader = readCsrfHeader(req)

  if (
    !csrfCookie ||
    !csrfHeader ||
    !safeEquals(csrfCookie, csrfHeader)
  ) {
    next(
      new ApiError(
        403,
        'CSRF token is missing or invalid',
        'CSRF_TOKEN_INVALID'
      )
    )
    return
  }

  next()
}