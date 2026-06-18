import type {
  ChangeEmailPayload,
  ChangePasswordPayload,
  DeleteAccountPayload,
  DisableTwoFactorPayload,
  VerifyEmailChangePayload,
  VerifyTwoFactorSetupPayload,
} from './application/dtos/security.dto'
import {
  SecurityMapper,
  type SecurityMapperContract,
} from './application/mappers/security.mapper'
import { CurrentSessionService } from './application/services/current-session.service'
import { SensitiveActionStepUpService } from './application/services/sensitive-action-step-up.service'
import { ChangeSecurityPasswordUseCase } from './application/use-cases/change-security-password.usecase'
import { DeleteSecurityAccountUseCase } from './application/use-cases/delete-security-account.usecase'
import { DisableTwoFactorUseCase } from './application/use-cases/disable-two-factor.usecase'
import { GetSecurityOverviewUseCase } from './application/use-cases/get-security-overview.usecase'
import { GetSecuritySessionsUseCase } from './application/use-cases/get-security-sessions.usecase'
import { GetTwoFactorStatusUseCase } from './application/use-cases/get-two-factor-status.usecase'
import { RequestEmailChangeUseCase } from './application/use-cases/request-email-change.usecase'
import { RevokeSecuritySessionUseCase } from './application/use-cases/revoke-security-session.usecase'
import { SetupTwoFactorUseCase } from './application/use-cases/setup-two-factor.usecase'
import { VerifyEmailChangeUseCase } from './application/use-cases/verify-email-change.usecase'
import { VerifyTwoFactorSetupUseCase } from './application/use-cases/verify-two-factor-setup.usecase'
import type { SecurityRepositoryContract } from './domain/repositories/security.repository.interface'
import type { SecurityAttemptStoreContract } from './domain/services/security-attempt-store.interface'
import type { SecurityAuditLoggerContract } from './domain/services/security-audit-logger.interface'
import type { SecurityEmailChangeTokenServiceContract } from './domain/services/security-email-change-token.service.interface'
import type { SecurityEmailChangeUrlServiceContract } from './domain/services/security-email-change-url.service.interface'
import type { SecurityEmailProviderContract } from './domain/services/security-email-provider.interface'
import type { SecurityPasswordHasherServiceContract } from './domain/services/security-password-hasher.service.interface'
import type { TwoFactorBackupCodeServiceContract } from './domain/services/two-factor-backup-code.service.interface'
import type { TwoFactorGatewayContract } from './domain/services/two-factor-gateway.interface'
import { otplibTwoFactorGateway } from './infrastructure/gateways/otplib-two-factor.gateway'
import { securityAuditLogger } from './infrastructure/loggers/security-audit.logger'
import { sharedSecurityEmailProvider } from './infrastructure/providers/shared-security-email.provider'
import { mongoSecurityRepository } from './infrastructure/repositories/mongo-security.repository'
import { bcryptSecurityPasswordHasherService } from './infrastructure/services/bcrypt-security-password-hasher.service'
import { clientSecurityEmailChangeUrlService } from './infrastructure/services/client-security-email-change-url.service'
import { cryptoSecurityEmailChangeTokenService } from './infrastructure/services/crypto-security-email-change-token.service'
import { cryptoTwoFactorBackupCodeService } from './infrastructure/services/crypto-two-factor-backup-code.service'
import { redisSecurityAttemptStore } from './infrastructure/stores/redis-security-attempt.store'

export class SecurityService {
  private readonly getSecurityOverviewUseCase: GetSecurityOverviewUseCase
  private readonly requestEmailChangeUseCase: RequestEmailChangeUseCase
  private readonly verifyEmailChangeUseCase: VerifyEmailChangeUseCase
  private readonly changeSecurityPasswordUseCase: ChangeSecurityPasswordUseCase
  private readonly getSecuritySessionsUseCase: GetSecuritySessionsUseCase
  private readonly revokeSecuritySessionUseCase: RevokeSecuritySessionUseCase
  private readonly getTwoFactorStatusUseCase: GetTwoFactorStatusUseCase
  private readonly setupTwoFactorUseCase: SetupTwoFactorUseCase
  private readonly verifyTwoFactorSetupUseCase: VerifyTwoFactorSetupUseCase
  private readonly disableTwoFactorUseCase: DisableTwoFactorUseCase
  private readonly deleteSecurityAccountUseCase: DeleteSecurityAccountUseCase

  constructor(
    securityRepository: SecurityRepositoryContract,
    securityEmailProvider: SecurityEmailProviderContract,
    passwordHasher: SecurityPasswordHasherServiceContract,
    twoFactorGateway: TwoFactorGatewayContract,
    securityAttemptStore: SecurityAttemptStoreContract,
    securityAuditLoggerContract: SecurityAuditLoggerContract,
    emailChangeTokenService: SecurityEmailChangeTokenServiceContract,
    emailChangeUrlService: SecurityEmailChangeUrlServiceContract,
    backupCodeService: TwoFactorBackupCodeServiceContract,
    securityMapper: SecurityMapperContract,
  ) {
    const currentSessionService = new CurrentSessionService(securityRepository)
    const sensitiveActionStepUpService = new SensitiveActionStepUpService(
      securityRepository,
      twoFactorGateway,
      passwordHasher,
      securityAuditLoggerContract,
    )

    this.getSecurityOverviewUseCase = new GetSecurityOverviewUseCase(
      securityRepository,
      currentSessionService,
      securityMapper,
    )
    this.requestEmailChangeUseCase = new RequestEmailChangeUseCase(
      securityRepository,
      securityEmailProvider,
      sensitiveActionStepUpService,
      emailChangeTokenService,
      emailChangeUrlService,
      securityAuditLoggerContract,
    )
    this.verifyEmailChangeUseCase = new VerifyEmailChangeUseCase(
      securityRepository,
      emailChangeTokenService,
      securityAuditLoggerContract,
    )
    this.changeSecurityPasswordUseCase = new ChangeSecurityPasswordUseCase(
      securityRepository,
      passwordHasher,
    )
    this.getSecuritySessionsUseCase = new GetSecuritySessionsUseCase(
      securityRepository,
      currentSessionService,
      securityMapper,
    )
    this.revokeSecuritySessionUseCase = new RevokeSecuritySessionUseCase(
      securityRepository,
      currentSessionService,
    )
    this.getTwoFactorStatusUseCase = new GetTwoFactorStatusUseCase(
      securityRepository,
    )
    this.setupTwoFactorUseCase = new SetupTwoFactorUseCase(
      securityRepository,
      twoFactorGateway,
    )
    this.verifyTwoFactorSetupUseCase = new VerifyTwoFactorSetupUseCase(
      securityRepository,
      twoFactorGateway,
      securityAttemptStore,
      backupCodeService,
    )
    this.disableTwoFactorUseCase = new DisableTwoFactorUseCase(
      securityRepository,
      twoFactorGateway,
      securityAttemptStore,
    )
    this.deleteSecurityAccountUseCase = new DeleteSecurityAccountUseCase(
      securityRepository,
      sensitiveActionStepUpService,
      securityAuditLoggerContract,
    )
  }

  getOverview(userId: string, refreshToken?: string) {
    return this.getSecurityOverviewUseCase.execute(userId, refreshToken)
  }

  requestEmailChange(userId: string, payload: ChangeEmailPayload) {
    return this.requestEmailChangeUseCase.execute(userId, payload)
  }

  verifyEmailChange(payload: VerifyEmailChangePayload) {
    return this.verifyEmailChangeUseCase.execute(payload)
  }

  changePassword(userId: string, payload: ChangePasswordPayload) {
    return this.changeSecurityPasswordUseCase.execute(userId, payload)
  }

  getSessions(userId: string, refreshToken?: string) {
    return this.getSecuritySessionsUseCase.execute(userId, refreshToken)
  }

  revokeSession(userId: string, sessionId: string, refreshToken?: string) {
    return this.revokeSecuritySessionUseCase.execute(
      userId,
      sessionId,
      refreshToken,
    )
  }

  getTwoFactorStatus(userId: string) {
    return this.getTwoFactorStatusUseCase.execute(userId)
  }

  setupTwoFactor(userId: string) {
    return this.setupTwoFactorUseCase.execute(userId)
  }

  verifyTwoFactorSetup(userId: string, payload: VerifyTwoFactorSetupPayload) {
    return this.verifyTwoFactorSetupUseCase.execute(userId, payload)
  }

  disableTwoFactor(userId: string, payload: DisableTwoFactorPayload) {
    return this.disableTwoFactorUseCase.execute(userId, payload)
  }

  deleteAccount(userId: string, payload: DeleteAccountPayload) {
    return this.deleteSecurityAccountUseCase.execute(userId, payload)
  }
}

const securityMapper = new SecurityMapper()

export const securityService = new SecurityService(
  mongoSecurityRepository,
  sharedSecurityEmailProvider,
  bcryptSecurityPasswordHasherService,
  otplibTwoFactorGateway,
  redisSecurityAttemptStore,
  securityAuditLogger,
  cryptoSecurityEmailChangeTokenService,
  clientSecurityEmailChangeUrlService,
  cryptoTwoFactorBackupCodeService,
  securityMapper,
)
