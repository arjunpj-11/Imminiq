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

import { otplibTwoFactorGateway } from './infrastructure/gateways/otplib-two-factor.gateway'
import { securityAuditLogger } from './infrastructure/loggers/security-audit.logger'
import { sharedSecurityEmailProvider } from './infrastructure/providers/shared-security-email.provider'
import { mongoSecurityRepository } from './infrastructure/repositories/mongo-security.repository'
import { bcryptSecurityPasswordHasherService } from './infrastructure/services/bcrypt-security-password-hasher.service'
import { clientSecurityEmailChangeUrlService } from './infrastructure/services/client-security-email-change-url.service'
import { cryptoSecurityEmailChangeTokenService } from './infrastructure/services/crypto-security-email-change-token.service'
import { cryptoTwoFactorBackupCodeService } from './infrastructure/services/crypto-two-factor-backup-code.service'
import { redisSecurityAttemptStore } from './infrastructure/stores/redis-security-attempt.store'
import { systemClock } from '../../infrastructure/time/system-clock'

export type SecurityUseCases = {
  getSecurityOverview: GetSecurityOverviewUseCase
  requestEmailChange: RequestEmailChangeUseCase
  verifyEmailChange: VerifyEmailChangeUseCase
  changeSecurityPassword: ChangeSecurityPasswordUseCase
  getSecuritySessions: GetSecuritySessionsUseCase
  revokeSecuritySession: RevokeSecuritySessionUseCase
  getTwoFactorStatus: GetTwoFactorStatusUseCase
  setupTwoFactor: SetupTwoFactorUseCase
  verifyTwoFactorSetup: VerifyTwoFactorSetupUseCase
  disableTwoFactor: DisableTwoFactorUseCase
  deleteSecurityAccount: DeleteSecurityAccountUseCase
}

export type SecurityServiceHelpers = {
  securityMapper: SecurityMapperContract
}

export type SecurityComposition = {
  useCases: SecurityUseCases
  helpers: SecurityServiceHelpers
}

export const createSecurityComposition = (): SecurityComposition => {
  const securityRepository = mongoSecurityRepository
  const securityEmailProvider = sharedSecurityEmailProvider
  const securityPasswordHasher = bcryptSecurityPasswordHasherService
  const twoFactorGateway = otplibTwoFactorGateway
  const securityAttemptStore = redisSecurityAttemptStore
  const securityAuditLoggerService = securityAuditLogger
  const emailChangeTokenService = cryptoSecurityEmailChangeTokenService
  const emailChangeUrlService = clientSecurityEmailChangeUrlService
  const twoFactorBackupCodeService = cryptoTwoFactorBackupCodeService
  const securityMapper = new SecurityMapper()

  const currentSessionService = new CurrentSessionService(
    securityRepository
  )

  const sensitiveActionStepUpService = new SensitiveActionStepUpService(
    securityRepository,
    twoFactorGateway,
    securityPasswordHasher,
    securityAuditLoggerService
  )

  return {
    useCases: {
      getSecurityOverview: new GetSecurityOverviewUseCase(
        securityRepository,
        currentSessionService,
        securityMapper
      ),

      requestEmailChange: new RequestEmailChangeUseCase(
        securityRepository,
        securityEmailProvider,
        sensitiveActionStepUpService,
        emailChangeTokenService,
        emailChangeUrlService,
        securityAuditLoggerService
      ),

      verifyEmailChange: new VerifyEmailChangeUseCase(
        securityRepository,
        emailChangeTokenService,
        securityAuditLoggerService
      ),

      changeSecurityPassword: new ChangeSecurityPasswordUseCase(
        securityRepository,
        securityPasswordHasher
      ),

      getSecuritySessions: new GetSecuritySessionsUseCase(
        securityRepository,
        currentSessionService,
        securityMapper
      ),

      revokeSecuritySession: new RevokeSecuritySessionUseCase(
        securityRepository,
        currentSessionService
      ),

      getTwoFactorStatus: new GetTwoFactorStatusUseCase(
        securityRepository
      ),

      setupTwoFactor: new SetupTwoFactorUseCase(
        securityRepository,
        twoFactorGateway
      ),

      verifyTwoFactorSetup: new VerifyTwoFactorSetupUseCase(
        securityRepository,
        twoFactorGateway,
        securityAttemptStore,
        twoFactorBackupCodeService
      ),

      disableTwoFactor: new DisableTwoFactorUseCase(
        securityRepository,
        twoFactorGateway,
        securityAttemptStore
      ),

      deleteSecurityAccount: new DeleteSecurityAccountUseCase(
        securityRepository,
        sensitiveActionStepUpService,
        securityAuditLoggerService,
        systemClock,
      ),
    },

    helpers: {
      securityMapper,
    },
  }
}
