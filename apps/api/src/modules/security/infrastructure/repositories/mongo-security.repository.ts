import type { RevokeSecuritySessionInput } from '../../domain/repositories/security-session.repository.interface'
import type { SecurityRepositoryContract } from '../../domain/repositories/security.repository.interface'
import type {
  ActivateTwoFactorInput,
  SavePendingTwoFactorSetupInput,
} from '../../domain/repositories/security-two-factor.repository.interface'
import type {
  ConfirmPendingEmailChangeInput,
  SavePendingEmailChangeInput,
  ScheduleAccountDeletionInput,
  UpdateSecurityPasswordHashInput,
} from '../../domain/repositories/security-user.repository.interface'
import { MongoSecuritySessionRepository } from './internal/mongo-security-session.repository'
import { MongoSecurityTwoFactorRepository } from './internal/mongo-security-two-factor.repository'
import { MongoSecurityUserRepository } from './internal/mongo-security-user.repository'
import { MongoSecurityMapper } from './shared/mongo-security.mapper'

type MongoSecurityRepositoryDependencies = {
  userRepository: MongoSecurityUserRepository
  sessionRepository: MongoSecuritySessionRepository
  twoFactorRepository: MongoSecurityTwoFactorRepository
}

export class MongoSecurityRepository implements SecurityRepositoryContract {
  private readonly _userRepository: MongoSecurityUserRepository
  private readonly _sessionRepository: MongoSecuritySessionRepository
  private readonly _twoFactorRepository: MongoSecurityTwoFactorRepository

  constructor(
    mapper: MongoSecurityMapper = new MongoSecurityMapper(),
    dependencies: Partial<MongoSecurityRepositoryDependencies> = {},
  ) {
    this._userRepository =
      dependencies.userRepository ??
      new MongoSecurityUserRepository(mapper)

    this._sessionRepository =
      dependencies.sessionRepository ??
      new MongoSecuritySessionRepository(mapper)

    this._twoFactorRepository =
      dependencies.twoFactorRepository ??
      new MongoSecurityTwoFactorRepository(mapper)
  }

  findUserById(userId: string) {
    return this._userRepository.findUserById(userId)
  }

  emailExists(email: string): Promise<boolean> {
    return this._userRepository.emailExists(email)
  }

  findUserByPendingEmailTokenHash(tokenHash: string) {
    return this._userRepository.findUserByPendingEmailTokenHash(tokenHash)
  }

  savePendingEmailChange(input: SavePendingEmailChangeInput) {
    return this._userRepository.savePendingEmailChange(input)
  }

  confirmPendingEmailChange(input: ConfirmPendingEmailChangeInput) {
    return this._userRepository.confirmPendingEmailChange(input)
  }

  clearPendingEmailChange(userId: string) {
    return this._userRepository.clearPendingEmailChange(userId)
  }

  updatePasswordHash(input: UpdateSecurityPasswordHashInput) {
    return this._userRepository.updatePasswordHash(input)
  }

  scheduleAccountDeletion(input: ScheduleAccountDeletionInput) {
    return this._userRepository.scheduleAccountDeletion(input)
  }

  findActiveSessions(userId: string) {
    return this._sessionRepository.findActiveSessions(userId)
  }

  findCurrentSessionByRefreshTokenHash(refreshTokenHash: string) {
    return this._sessionRepository.findCurrentSessionByRefreshTokenHash(
      refreshTokenHash,
    )
  }

  revokeSessionById(input: RevokeSecuritySessionInput) {
    return this._sessionRepository.revokeSessionById(input)
  }

  revokeAllSessions(userId: string): Promise<void> {
    return this._sessionRepository.revokeAllSessions(userId)
  }

  findTwoFactorByUserId(userId: string) {
    return this._twoFactorRepository.findTwoFactorByUserId(userId)
  }

  findTwoFactorWithSecret(userId: string) {
    return this._twoFactorRepository.findTwoFactorWithSecret(userId)
  }

  savePendingTwoFactorSetup(input: SavePendingTwoFactorSetupInput) {
    return this._twoFactorRepository.savePendingTwoFactorSetup(input)
  }

  activateTwoFactor(input: ActivateTwoFactorInput) {
    return this._twoFactorRepository.activateTwoFactor(input)
  }

  disableTwoFactor(userId: string) {
    return this._twoFactorRepository.disableTwoFactor(userId)
  }
}

export const mongoSecurityRepository = new MongoSecurityRepository()
