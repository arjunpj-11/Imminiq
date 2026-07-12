import type { IAuthRedirectResolver } from '../../domain/services/auth-redirect.interface'
import type { LoginRedirectPath } from '../../domain/value-objects/login-redirect-path.vo'

export type { IAuthRedirectResolver }

export class AuthRedirectResolver implements IAuthRedirectResolver {
  async resolveRedirectPath(_userId: string): Promise<LoginRedirectPath> {
    return '/dashboard'
  }
}