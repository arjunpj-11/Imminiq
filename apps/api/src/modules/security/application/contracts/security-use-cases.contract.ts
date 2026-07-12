import type * as Application from '../index'
export type SecurityUseCases = {
  getSecurityOverview: Application.IGetSecurityOverviewUseCase
  requestEmailChange: Application.IRequestEmailChangeUseCase
  verifyEmailChange: Application.IVerifyEmailChangeUseCase
  changeSecurityPassword: Application.IChangeSecurityPasswordUseCase
  revokeSecuritySession: Application.IRevokeSecuritySessionUseCase
  setupTwoFactor: Application.ISetupTwoFactorUseCase
  verifyTwoFactorSetup: Application.IVerifyTwoFactorSetupUseCase
  disableTwoFactor: Application.IDisableTwoFactorUseCase
  deleteSecurityAccount: Application.IDeleteSecurityAccountUseCase
}
