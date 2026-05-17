import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import { env } from '../../config/env'
import { ApiError } from '../utils/ApiError'

const UNSAFE_METHODS = new Set([
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
])

const clientOrigin = new URL(env.CLIENT_URL).origin

const readOrigin = (value?: string): string | null => {
  if (!value) {
    return null
  }

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

/**
 * Browsers generally send Origin for unsafe cross-origin requests.
 * Referer is used as a secondary signal where Origin is absent.
 * Requests with neither header are allowed so CLI/API tools and
 * server-to-server calls are not broken by browser-only CSRF checks.
 */
export const verifyBrowserRequestOrigin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!UNSAFE_METHODS.has(req.method.toUpperCase())) {
    next()
    return
  }

  const requestOrigin = readOrigin(req.get('origin'))
  const requestRefererOrigin = readOrigin(req.get('referer'))

  if (requestOrigin && requestOrigin !== clientOrigin) {
    next(
      new ApiError(
        403,
        'Request origin is not allowed',
        'REQUEST_ORIGIN_REJECTED'
      )
    )
    return
  }

  if (
    !requestOrigin &&
    requestRefererOrigin &&
    requestRefererOrigin !== clientOrigin
  ) {
    next(
      new ApiError(
        403,
        'Request referer is not allowed',
        'REQUEST_REFERER_REJECTED'
      )
    )
    return
  }

  next()
}
