import type * as Application from '../index'
export type SecurityUseCases = {
  getSecurityOverview: Application.IGetSecurityOverviewUseCase
  requestEmailChange: Application.IRequestEmailChangeUseCase
  verifyEmailChange: Application.IVerifyEmailChangeUseCase
  changeSecurityPassword: Application.IChangeSecurityPasswordUseCase
  getSecuritySessions: Application.IGetSecuritySessionsUseCase
  revokeSecuritySession: Application.IRevokeSecuritySessionUseCase
  getTwoFactorStatus: Application.IGetTwoFactorStatusUseCase
  setupTwoFactor: Application.ISetupTwoFactorUseCase
  verifyTwoFactorSetup: Application.IVerifyTwoFactorSetupUseCase
  disableTwoFactor: Application.IDisableTwoFactorUseCase
  deleteSecurityAccount: Application.IDeleteSecurityAccountUseCase
}
