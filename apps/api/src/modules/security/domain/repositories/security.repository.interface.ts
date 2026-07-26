import type { ISecuritySessionRepository } from './security-session.repository.interface';
import type { ISecurityTwoFactorRepository } from './security-two-factor.repository.interface';
import type { ISecurityUserRepository } from './security-user.repository.interface';

export interface ISecurityRepository
  extends ISecurityUserRepository, ISecuritySessionRepository, ISecurityTwoFactorRepository {}

export type { RevokeSecuritySessionInput } from './security-session.repository.interface';

export type {
  ActivateTwoFactorInput,
  PendingTwoFactorSetupInput,
  SavePendingTwoFactorSetupInput,
} from './security-two-factor.repository.interface';

export type {
  ConfirmPendingEmailChangeInput,
  PendingEmailChangeInput,
  SavePendingEmailChangeInput,
  ScheduleAccountDeletionInput,
  UpdateSecurityPasswordHashInput,
} from './security-user.repository.interface';
