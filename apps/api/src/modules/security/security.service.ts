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
  private readonly _useCases: SecurityComposition['useCases']

  constructor(composition: SecurityComposition) {
    this._useCases = composition.useCases
  }

  getOverview(userId: string, refreshToken?: string) {
    return this._useCases.getSecurityOverview.execute(userId, refreshToken)
  }

  requestEmailChange(userId: string, payload: ChangeEmailPayload) {
    return this._useCases.requestEmailChange.execute(userId, payload)
  }

  verifyEmailChange(payload: VerifyEmailChangePayload) {
    return this._useCases.verifyEmailChange.execute(payload)
  }

  changePassword(userId: string, payload: ChangePasswordPayload) {
    return this._useCases.changeSecurityPassword.execute(userId, payload)
  }

  getSessions(userId: string, refreshToken?: string) {
    return this._useCases.getSecuritySessions.execute(userId, refreshToken)
  }

  revokeSession(userId: string, sessionId: string, refreshToken?: string) {
    return this._useCases.revokeSecuritySession.execute(
      userId,
      sessionId,
      refreshToken
    )
  }

  getTwoFactorStatus(userId: string) {
    return this._useCases.getTwoFactorStatus.execute(userId)
  }

  setupTwoFactor(userId: string) {
    return this._useCases.setupTwoFactor.execute(userId)
  }

  verifyTwoFactorSetup(userId: string, payload: VerifyTwoFactorSetupPayload) {
    return this._useCases.verifyTwoFactorSetup.execute(userId, payload)
  }

  disableTwoFactor(userId: string, payload: DisableTwoFactorPayload) {
    return this._useCases.disableTwoFactor.execute(userId, payload)
  }

  deleteAccount(userId: string, payload: DeleteAccountPayload) {
    return this._useCases.deleteSecurityAccount.execute(userId, payload)
  }
}

export const securityService = new SecurityService(
  createSecurityComposition()
)