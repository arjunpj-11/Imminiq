import type * as Application from '../index'
export type SecurityUseCases = {
  getSecurityOverview: Application.GetSecurityOverviewUseCase
  requestEmailChange: Application.RequestEmailChangeUseCase
  verifyEmailChange: Application.VerifyEmailChangeUseCase
  changeSecurityPassword: Application.ChangeSecurityPasswordUseCase
  getSecuritySessions: Application.GetSecuritySessionsUseCase
  revokeSecuritySession: Application.RevokeSecuritySessionUseCase
  getTwoFactorStatus: Application.GetTwoFactorStatusUseCase
  setupTwoFactor: Application.SetupTwoFactorUseCase
  verifyTwoFactorSetup: Application.VerifyTwoFactorSetupUseCase
  disableTwoFactor: Application.DisableTwoFactorUseCase
  deleteSecurityAccount: Application.DeleteSecurityAccountUseCase
}
