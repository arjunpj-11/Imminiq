import type { LoginRedirectPath } from '../types/auth.types'

export interface AuthRedirectServiceContract {
  resolveRedirectPath(userId: string): Promise<LoginRedirectPath>
}
