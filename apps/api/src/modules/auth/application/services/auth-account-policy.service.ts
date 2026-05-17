import { ApiError } from '../../../../shared/utils/ApiError'

export const ensureUserCanAuthenticate = (user: {
  status: string
}) => {
  if (user.status === 'blocked' || user.status === 'banned') {
    throw new ApiError(403, 'Account blocked', 'ACCOUNT_BLOCKED')
  }

  if (user.status === 'deactivated') {
    throw new ApiError(403, 'Account deactivated', 'ACCOUNT_DEACTIVATED')
  }

  if (user.status === 'paused') {
    throw new ApiError(403, 'Account paused', 'ACCOUNT_PAUSED')
  }
}
