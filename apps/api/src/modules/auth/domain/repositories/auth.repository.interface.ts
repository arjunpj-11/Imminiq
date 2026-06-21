import type { AuthSessionRepositoryContract } from './auth-session.repository.interface'
import type { AuthTwoFactorRepositoryContract } from './auth-two-factor.repository.interface'
import type { AuthUserRepositoryContract } from './auth-user.repository.interface'

export interface AuthRepositoryContract
  extends AuthUserRepositoryContract,
    AuthSessionRepositoryContract,
    AuthTwoFactorRepositoryContract {}