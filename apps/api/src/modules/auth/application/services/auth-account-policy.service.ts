import { ApiError } from '../../../../shared/utils/ApiError'

type AuthenticatableUser = {
  status: string
  scheduledDeletionAt?: Date | string | null
}

const hasRecoverableScheduledDeletion = (
  user: AuthenticatableUser
) => {
  if (user.status !== 'deactivated' || !user.scheduledDeletionAt) {
    return false
  }

  const scheduledDeletionTime = new Date(
    user.scheduledDeletionAt
  ).getTime()

  return Number.isFinite(scheduledDeletionTime) &&
    scheduledDeletionTime > Date.now()
}

export const ensureUserCanAuthenticate = (
  user: AuthenticatableUser
) => {
  if (user.status === 'blocked' || user.status === 'banned') {
    throw new ApiError(403, 'Account blocked', 'ACCOUNT_BLOCKED')
  }

  if (user.status === 'deactivated') {
    if (hasRecoverableScheduledDeletion(user)) {
      return
    }

    throw new ApiError(403, 'Account deactivated', 'ACCOUNT_DEACTIVATED')
  }

  if (user.status === 'paused') {
    throw new ApiError(403, 'Account paused', 'ACCOUNT_PAUSED')
  }
}
