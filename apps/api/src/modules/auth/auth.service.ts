import type {
  AuthLoginResult,
  AuthLoginSuccessResult,
  AuthRole,
  AuthUser,
  LoginPayload,
  OAuthLoginUser,
  RegisterPayload,
  RequestMeta,
  TokenPair,
  TwoFactorLoginVerifyPayload,
  OtpPurpose,
} from './domain/types/auth.types'

import { mongoAuthRepository } from './infrastructure/repositories/mongo-auth.repository'
import { AuthNotificationService } from './infrastructure/auth-notification.service'
import { AuthRedirectService } from './infrastructure/auth-redirect.service'

import { RegisterUserUseCase } from './application/use-cases/register-user.usecase'
import { LoginUserUseCase } from './application/use-cases/login-user.usecase'
import { HandleOAuthLoginUseCase } from './application/use-cases/handle-oauth-login.usecase'
import { VerifyTwoFactorLoginUseCase } from './application/use-cases/verify-two-factor-login.usecase'
import { LogoutUserUseCase } from './application/use-cases/logout-user.usecase'
import { LogoutAllSessionsUseCase } from './application/use-cases/logout-all-sessions.usecase'
import { RefreshAuthTokensUseCase } from './application/use-cases/refresh-auth-tokens.usecase'
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.usecase'
import { VerifyAccountUseCase } from './application/use-cases/verify-account.usecase'
import { ResendOtpUseCase } from './application/use-cases/resend-otp.usecase'
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.usecase'
import { VerifyResetCodeUseCase } from './application/use-cases/verify-reset-code.usecase'
import { ResetPasswordUseCase } from './application/use-cases/reset-password.usecase'
import { ChangePasswordUseCase } from './application/use-cases/change-password.usecase'
import { CheckIdentifierUseCase } from './application/use-cases/check-identifier.usecase'
import { CheckUsernameUseCase } from './application/use-cases/check-username.usecase'
import { GetAuthSessionsUseCase } from './application/use-cases/get-auth-sessions.usecase'
import { RevokeAuthSessionUseCase } from './application/use-cases/revoke-auth-session.usecase'

import {
  issueTokenPair,
  generateTwoFactorChallengeToken,
} from './application/services/auth-token.service'
import { generateOtp } from './application/services/otp.service'
import {
  generateRegistrationUsername,
  generateUsername,
  generateUniqueUsernameFromSource,
} from './application/services/username-generator.service'
import { formatAuthUser } from './application/services/auth-user-formatter.service'

const authRepository = mongoAuthRepository
const authNotificationService = new AuthNotificationService(authRepository)
const authRedirectService = new AuthRedirectService()

const registerUserUseCase = new RegisterUserUseCase(
  authRepository,
  authNotificationService
)

const loginUserUseCase = new LoginUserUseCase(
  authRepository,
  authNotificationService,
  authRedirectService
)

const handleOAuthLoginUseCase = new HandleOAuthLoginUseCase(
  authRepository,
  authRedirectService
)

const verifyTwoFactorLoginUseCase = new VerifyTwoFactorLoginUseCase(
  authRepository,
  authRedirectService
)

const logoutUserUseCase = new LogoutUserUseCase(authRepository)
const logoutAllSessionsUseCase = new LogoutAllSessionsUseCase(authRepository)
const refreshAuthTokensUseCase = new RefreshAuthTokensUseCase(authRepository)
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository)
const verifyAccountUseCase = new VerifyAccountUseCase(authRepository)

const resendOtpUseCase = new ResendOtpUseCase(
  authRepository,
  authNotificationService
)

const forgotPasswordUseCase = new ForgotPasswordUseCase(
  authRepository,
  authNotificationService
)

const verifyResetCodeUseCase = new VerifyResetCodeUseCase(authRepository)
const resetPasswordUseCase = new ResetPasswordUseCase(authRepository)
const changePasswordUseCase = new ChangePasswordUseCase(authRepository)
const checkIdentifierUseCase = new CheckIdentifierUseCase(authRepository)
const checkUsernameUseCase = new CheckUsernameUseCase(authRepository)
const getAuthSessionsUseCase = new GetAuthSessionsUseCase(authRepository)
const revokeAuthSessionUseCase = new RevokeAuthSessionUseCase(authRepository)

/**
 * Composition root / service facade.
 * Controllers call this facade. This file wires concrete infrastructure to
 * application use cases and contains no business or HTTP logic.
 */
export const authService = {
  register: (payload: RegisterPayload) =>
    registerUserUseCase.execute(payload),

  login: (
    payload: LoginPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> =>
    loginUserUseCase.execute(payload, meta),

  handleOAuthLogin: (
    user: OAuthLoginUser,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> =>
    handleOAuthLoginUseCase.execute(user, meta),

  verifyTwoFactorLogin: (
    challengeToken: string,
    payload: TwoFactorLoginVerifyPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginSuccessResult> =>
    verifyTwoFactorLoginUseCase.execute(challengeToken, payload, meta),

  logout: (refreshToken: string) =>
    logoutUserUseCase.execute(refreshToken),

  logoutAll: (userId: string) =>
    logoutAllSessionsUseCase.execute(userId),

  refreshTokens: (
    refreshToken: string,
    meta?: RequestMeta
  ): Promise<TokenPair> =>
    refreshAuthTokensUseCase.execute(refreshToken, meta),

  getMe: (userId: string): Promise<AuthUser> =>
    getCurrentUserUseCase.execute(userId),

  verifyAccount: (identifier: string, otp: string) =>
    verifyAccountUseCase.execute(identifier, otp),

  resendOtp: (identifier: string, purpose: OtpPurpose) =>
    resendOtpUseCase.execute(identifier, purpose),

  forgotPassword: (identifier: string) =>
    forgotPasswordUseCase.execute(identifier),

  verifyResetCode: (identifier: string, otp: string) =>
    verifyResetCodeUseCase.execute(identifier, otp),

  resetPassword: (resetToken: string, newPassword: string) =>
    resetPasswordUseCase.execute(resetToken, newPassword),

  changePassword: (
    userId: string,
    currentPassword: string,
    newPassword: string
  ) =>
    changePasswordUseCase.execute(userId, currentPassword, newPassword),

  checkIdentifier: (identifier: string) =>
    checkIdentifierUseCase.execute(identifier),

  checkUsername: (username: string) =>
    checkUsernameUseCase.execute(username),

  getSessions: (userId: string) =>
    getAuthSessionsUseCase.execute(userId),

  revokeSession: (userId: string, sessionId: string) =>
    revokeAuthSessionUseCase.execute(userId, sessionId),

  // Kept for compatibility with current external/internal usages.
  generateTokenPair: (
    userId: string,
    role: AuthRole,
    meta?: RequestMeta
  ): Promise<TokenPair> =>
    issueTokenPair(authRepository, userId, role, meta),

  generateTwoFactorChallengeToken,

  generateOtp,

  generateRegistrationUsername: (data: {
    email?: string
    fullName: string
  }) => generateRegistrationUsername(data, authRepository),

  generateUsername: (fullName: string) =>
    generateUsername(fullName, authRepository),

  generateUniqueUsernameFromSource: (source: string) =>
    generateUniqueUsernameFromSource(source, authRepository),

  formatter: formatAuthUser,
}

export type { OAuthLoginUser }
