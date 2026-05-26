import { trackerRepository } from '../../trackers'
import type { AuthRedirectServiceContract } from '../domain/services/auth-redirect.service.interface'
import type { LoginRedirectPath } from '../domain/types/auth.types'

export class AuthRedirectService implements AuthRedirectServiceContract {
  async resolveRedirectPath(userId: string): Promise<LoginRedirectPath> {
    const hasTracker = await trackerRepository.hasAnyTrackerForUser(userId)

    return hasTracker
      ? '/dashboard'
      : '/onboarding/step-1'
  }
}
