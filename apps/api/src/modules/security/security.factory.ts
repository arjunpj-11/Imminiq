import type { SecurityUseCases } from './application/contracts/security-use-cases.contract'
import {
  SecurityMapper,
  type ISecurityMapper,
} from './application/mappers/security.mapper'
import { CurrentSessionResolver } from './application/services/current-session.service'
import { SensitiveActionAuthorizer } from './application/services/sensitive-action-step-up.service'
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
import { bcryptSecurityPasswordHasher } from './infrastructure/services/bcrypt-security-password-hasher.service'
import { clientSecurityEmailChangeUrlBuilder } from './infrastructure/services/client-security-email-change-url.service'
import { cryptoSecurityEmailChangeToken } from './infrastructure/services/crypto-security-email-change-token.service'
import { cryptoTwoFactorBackupCodeManager } from './infrastructure/services/crypto-two-factor-backup-code.service'
import { redisSecurityAttemptStore } from './infrastructure/stores/redis-security-attempt.store'
import { systemClock } from '../../infrastructure/time/system-clock'


export type SecurityServiceHelpers = {
  securityMapper: ISecurityMapper
}

export type SecurityComposition = {
  useCases: SecurityUseCases
  helpers: SecurityServiceHelpers
}

export const createSecurityComposition = (): SecurityComposition => {
  const securityRepository = mongoSecurityRepository
  const securityEmailProvider = sharedSecurityEmailProvider
  const securityPasswordHasher = bcryptSecurityPasswordHasher
  const twoFactorGateway = otplibTwoFactorGateway
  const securityAttemptStore = redisSecurityAttemptStore
  const auditLogger = securityAuditLogger
  const emailChangeToken = cryptoSecurityEmailChangeToken
  const emailChangeUrlBuilder = clientSecurityEmailChangeUrlBuilder
  const backupCodeManager = cryptoTwoFactorBackupCodeManager
  const securityMapper = new SecurityMapper()

  const currentSessionResolver = new CurrentSessionResolver(
    securityRepository
  )

  const sensitiveActionAuthorizer = new SensitiveActionAuthorizer(
    securityRepository,
    twoFactorGateway,
    securityPasswordHasher,
    auditLogger
  )

  return {
    useCases: {
      getSecurityOverview: new GetSecurityOverviewUseCase(
        securityRepository,
        currentSessionResolver,
        securityMapper
      ),

      requestEmailChange: new RequestEmailChangeUseCase(
        securityRepository,
        securityEmailProvider,
        sensitiveActionAuthorizer,
        emailChangeToken,
        emailChangeUrlBuilder,
        auditLogger
      ),

      verifyEmailChange: new VerifyEmailChangeUseCase(
        securityRepository,
        emailChangeToken,
        auditLogger
      ),

      changeSecurityPassword: new ChangeSecurityPasswordUseCase(
        securityRepository,
        securityPasswordHasher
      ),

      getSecuritySessions: new GetSecuritySessionsUseCase(
        securityRepository,
        currentSessionResolver,
        securityMapper
      ),

      revokeSecuritySession: new RevokeSecuritySessionUseCase(
        securityRepository,
        currentSessionResolver
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
        backupCodeManager
      ),

      disableTwoFactor: new DisableTwoFactorUseCase(
        securityRepository,
        twoFactorGateway,
        securityAttemptStore
      ),

      deleteSecurityAccount: new DeleteSecurityAccountUseCase(
        securityRepository,
        sensitiveActionAuthorizer,
        auditLogger,
        systemClock,
      ),
    },

    helpers: {
      securityMapper,
    },
  }
}
