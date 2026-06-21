import type { LoginRedirectPath } from '../value-objects/login-redirect-path.vo'

export interface AuthRedirectServiceContract {
  resolveRedirectPath(userId: string): Promise<LoginRedirectPath>
}
