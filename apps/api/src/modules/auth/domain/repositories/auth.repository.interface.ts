import type { IAuthSessionRepository } from './auth-session.repository.interface';
import type { IAuthTwoFactorRepository } from './auth-two-factor.repository.interface';
import type { IAuthUserRepository } from './auth-user.repository.interface';

export interface IAuthRepository
  extends IAuthUserRepository, IAuthSessionRepository, IAuthTwoFactorRepository {}
