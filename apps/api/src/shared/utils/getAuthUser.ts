import { Request } from 'express'
import { ApiError } from './ApiError'

export const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED')
  }

  return req.user
}