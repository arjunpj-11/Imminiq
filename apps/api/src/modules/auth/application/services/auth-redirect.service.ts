import type { AuthRedirectResolverContract } from '../../domain/services/auth-redirect.interface'
import type { LoginRedirectPath } from '../../domain/value-objects/login-redirect-path.vo'

export type { AuthRedirectResolverContract }

export class AuthRedirectResolver implements AuthRedirectResolverContract {
  async resolveRedirectPath(_userId: string): Promise<LoginRedirectPath> {
    return '/dashboard'
  }
}