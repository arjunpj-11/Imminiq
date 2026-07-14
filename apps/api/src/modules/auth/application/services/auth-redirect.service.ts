import type { IAuthRedirectResolver } from '../../domain/services/auth-redirect.interface';
import type { AuthRole } from '../../domain/value-objects/auth-role.vo';
import type { LoginRedirectPath } from '../../domain/value-objects/login-redirect-path.vo';

export type { IAuthRedirectResolver };

export class AuthRedirectResolver implements IAuthRedirectResolver {
  async resolveRedirectPath(_userId: string, role: AuthRole): Promise<LoginRedirectPath> {
    if (role === 'admin' || role === 'superadmin') {
      return '/admin';
    }

    return '/dashboard';
  }
}
