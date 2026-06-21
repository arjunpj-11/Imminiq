import type {
  ChangeEmailPayload,
  ChangePasswordPayload,
  DeleteAccountPayload,
  DisableTwoFactorPayload,
  VerifyEmailChangePayload,
  VerifyTwoFactorSetupPayload,
} from './application/dtos/security.dto'
import {
  createSecurityComposition,
  type SecurityComposition,
} from './security.factory'

export class SecurityService {
  private readonly useCases: SecurityComposition['useCases']

  constructor(composition: SecurityComposition) {
    this.useCases = composition.useCases
  }

  getOverview(userId: string, refreshToken?: string) {
    return this.useCases.getSecurityOverview.execute(userId, refreshToken)
  }

  requestEmailChange(userId: string, payload: ChangeEmailPayload) {
    return this.useCases.requestEmailChange.execute(userId, payload)
  }

  verifyEmailChange(payload: VerifyEmailChangePayload) {
    return this.useCases.verifyEmailChange.execute(payload)
  }

  changePassword(userId: string, payload: ChangePasswordPayload) {
    return this.useCases.changeSecurityPassword.execute(userId, payload)
  }

  getSessions(userId: string, refreshToken?: string) {
    return this.useCases.getSecuritySessions.execute(userId, refreshToken)
  }

  revokeSession(userId: string, sessionId: string, refreshToken?: string) {
    return this.useCases.revokeSecuritySession.execute(
      userId,
      sessionId,
      refreshToken
    )
  }

  getTwoFactorStatus(userId: string) {
    return this.useCases.getTwoFactorStatus.execute(userId)
  }

  setupTwoFactor(userId: string) {
    return this.useCases.setupTwoFactor.execute(userId)
  }

  verifyTwoFactorSetup(userId: string, payload: VerifyTwoFactorSetupPayload) {
    return this.useCases.verifyTwoFactorSetup.execute(userId, payload)
  }

  disableTwoFactor(userId: string, payload: DisableTwoFactorPayload) {
    return this.useCases.disableTwoFactor.execute(userId, payload)
  }

  deleteAccount(userId: string, payload: DeleteAccountPayload) {
    return this.useCases.deleteSecurityAccount.execute(userId, payload)
  }
}

export const securityService = new SecurityService(
  createSecurityComposition()
)