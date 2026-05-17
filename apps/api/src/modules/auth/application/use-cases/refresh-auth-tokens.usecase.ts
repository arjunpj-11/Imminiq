import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'
import type {
  RequestMeta,
  TokenPair,
} from '../../domain/types/auth.types'
import { ensureUserCanAuthenticate } from '../services/auth-account-policy.service'
import {
  generateAccessToken,
  generateRefreshToken,
} from '../services/auth-token.service'

export class RefreshAuthTokensUseCase {
  async execute(
    refreshToken: string,
    meta?: RequestMeta
  ): Promise<TokenPair> {
    const tokenRecord = await authRepository.findRefreshToken(refreshToken)

    if (!tokenRecord) {
      throw new ApiError(401, 'Invalid refresh token', 'UNAUTHORIZED')
    }

    const user = await authRepository.findById(tokenRecord.userId.toString())

    if (!user) {
      throw new ApiError(401, 'User not found', 'UNAUTHORIZED')
    }

    ensureUserCanAuthenticate(user)

    const accessToken = generateAccessToken(
      user._id.toString(),
      user.role
    )

    const newRefreshToken = generateRefreshToken()

    const rotatedSession =
      await authRepository.rotateRefreshTokenInSameSession(
        tokenRecord._id.toString(),
        newRefreshToken,
        meta
      )

    if (!rotatedSession) {
      throw new ApiError(
        401,
        'Unable to refresh session',
        'SESSION_REFRESH_FAILED'
      )
    }

    return {
      accessToken,
      refreshToken: newRefreshToken,
    }
  }
}
