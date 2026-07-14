import type { LoginRedirectPath } from '../value-objects/login-redirect-path.vo';
import type { AuthRole } from '../value-objects/auth-role.vo';

export interface IAuthRedirectResolver {
  resolveRedirectPath(userId: string, role: AuthRole): Promise<LoginRedirectPath>;
}
