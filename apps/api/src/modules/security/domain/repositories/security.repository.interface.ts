import type { SecuritySessionRepositoryContract } from './security-session.repository.interface'
import type { SecurityTwoFactorRepositoryContract } from './security-two-factor.repository.interface'
import type { SecurityUserRepositoryContract } from './security-user.repository.interface'

export interface SecurityRepositoryContract
  extends
    SecurityUserRepositoryContract,
    SecuritySessionRepositoryContract,
    SecurityTwoFactorRepositoryContract {}
