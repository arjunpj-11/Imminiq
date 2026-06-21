import type { AuthRedirectServiceContract } from '../../domain/services/auth-redirect.service.interface'
import type { LoginRedirectPath } from '../../domain/value-objects/login-redirect-path.vo'

export type { AuthRedirectServiceContract }

export class AuthRedirectService implements AuthRedirectServiceContract {
  async resolveRedirectPath(_userId: string): Promise<LoginRedirectPath> {
    return '/dashboard'
  }
}