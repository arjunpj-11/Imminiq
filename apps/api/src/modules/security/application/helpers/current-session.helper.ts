import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'

export const getCurrentSessionId = async (
  securityRepository: SecurityRepository,
  refreshToken?: string
): Promise<string | null> => {
  if (!refreshToken) {
    return null
  }

  const currentTokenRecord =
    await securityRepository.findCurrentRefreshTokenRecord(refreshToken)

  if (!currentTokenRecord) {
    return null
  }

  return String(currentTokenRecord._id)
}
