import type * as Application from '../index'
export type AuthUseCases = {
  registerUser: Application.RegisterUserUseCase
  loginUser: Application.LoginUserUseCase
  handleOAuthLogin: Application.HandleOAuthLoginUseCase
  verifyTwoFactorLogin: Application.VerifyTwoFactorLoginUseCase
  logoutUser: Application.LogoutUserUseCase
  logoutAllSessions: Application.LogoutAllSessionsUseCase
  refreshAuthTokens: Application.RefreshAuthTokensUseCase
  getCurrentUser: Application.GetCurrentUserUseCase
  verifyAccount: Application.VerifyAccountUseCase
  resendOtp: Application.ResendOtpUseCase
  forgotPassword: Application.ForgotPasswordUseCase
  verifyResetCode: Application.VerifyResetCodeUseCase
  resetPassword: Application.ResetPasswordUseCase
  changePassword: Application.ChangePasswordUseCase
  checkIdentifier: Application.CheckIdentifierUseCase
  checkUsername: Application.CheckUsernameUseCase
  getAuthSessions: Application.GetAuthSessionsUseCase
  revokeAuthSession: Application.RevokeAuthSessionUseCase
}
