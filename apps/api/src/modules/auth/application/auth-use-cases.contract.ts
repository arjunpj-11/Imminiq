import type * as Application from './index';
export type AuthUseCases = {
  registerUser: Application.IRegisterUserUseCase;
  loginUser: Application.ILoginUserUseCase;
  handleOAuthLogin: Application.IHandleOAuthLoginUseCase;
  verifyTwoFactorLogin: Application.IVerifyTwoFactorLoginUseCase;
  logoutUser: Application.ILogoutUserUseCase;
  refreshAuthTokens: Application.IRefreshAuthTokensUseCase;
  getCurrentUser: Application.IGetCurrentUserUseCase;
  verifyAccount: Application.IVerifyAccountUseCase;
  resendOtp: Application.IResendOtpUseCase;
  forgotPassword: Application.IForgotPasswordUseCase;
  verifyResetCode: Application.IVerifyResetCodeUseCase;
  resetPassword: Application.IResetPasswordUseCase;
};
