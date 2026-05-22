import type { LoginRedirectPath } from '../../domain/types/auth.types'
import { trackerRepository } from '../../../trackers'

export const resolveRedirectPath = async (
  userId: string
): Promise<LoginRedirectPath> => {
  const hasTracker = await trackerRepository.hasAnyTrackerForUser(userId)

  return hasTracker
    ? '/dashboard'
    : '/onboarding/step-1'
}
