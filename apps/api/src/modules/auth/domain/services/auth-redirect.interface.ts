import type { LoginRedirectPath } from '../value-objects/login-redirect-path.vo'

export interface AuthRedirectResolverContract {
  resolveRedirectPath(userId: string): Promise<LoginRedirectPath>
}
