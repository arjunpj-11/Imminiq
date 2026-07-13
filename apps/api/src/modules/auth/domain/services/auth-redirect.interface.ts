import type { LoginRedirectPath } from '../value-objects/login-redirect-path.vo';

export interface IAuthRedirectResolver {
  resolveRedirectPath(userId: string): Promise<LoginRedirectPath>;
}
