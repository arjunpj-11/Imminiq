import type {
  AuthLoginResult,
  AuthLoginSuccessResult,
  AuthUser,
  LoginPayload,
  OAuthLoginUser,
  RegisterPayload,
  RequestMeta,
  TokenPair,
  TwoFactorLoginVerifyPayload,
} from './application/dtos/auth.dto'

import type { AuthRole } from './domain/value-objects/auth-role.vo'
import type { OtpPurpose } from './domain/value-objects/otp-purpose.vo'

import {
  createAuthComposition,
  type AuthComposition,
  type AuthUserMapperInput,
} from './auth.factory'

export class AuthService {
  private readonly _useCases: AuthComposition['useCases']
  private readonly _helpers: AuthComposition['helpers']

  constructor(composition: AuthComposition) {
    this._useCases = composition.useCases
    this._helpers = composition.helpers
  }

  register(payload: RegisterPayload) {
    return this._useCases.registerUser.execute(payload)
  }

  login(
    payload: LoginPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> {
    return this._useCases.loginUser.execute(payload, meta)
  }

  handleOAuthLogin(
    user: OAuthLoginUser,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> {
    return this._useCases.handleOAuthLogin.execute(user, meta)
  }

  verifyTwoFactorLogin(
    challengeToken: string,
    payload: TwoFactorLoginVerifyPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginSuccessResult> {
    return this._useCases.verifyTwoFactorLogin.execute(
      challengeToken,
      payload,
      meta
    )
  }

  logout(refreshToken: string) {
    return this._useCases.logoutUser.execute(refreshToken)
  }

  logoutAll(userId: string) {
    return this._useCases.logoutAllSessions.execute(userId)
  }

  refreshTokens(
    refreshToken: string,
    meta?: RequestMeta
  ): Promise<TokenPair> {
    return this._useCases.refreshAuthTokens.execute(refreshToken, meta)
  }

  getMe(userId: string): Promise<AuthUser> {
    return this._useCases.getCurrentUser.execute(userId)
  }

  verifyAccount(identifier: string, otp: string) {
    return this._useCases.verifyAccount.execute(identifier, otp)
  }

  resendOtp(identifier: string, purpose: OtpPurpose) {
    return this._useCases.resendOtp.execute(identifier, purpose)
  }

  forgotPassword(identifier: string) {
    return this._useCases.forgotPassword.execute(identifier)
  }

  verifyResetCode(identifier: string, otp: string) {
    return this._useCases.verifyResetCode.execute(identifier, otp)
  }

  resetPassword(resetToken: string, newPassword: string) {
    return this._useCases.resetPassword.execute(resetToken, newPassword)
  }

  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    return this._useCases.changePassword.execute(
      userId,
      currentPassword,
      newPassword
    )
  }

  checkIdentifier(identifier: string) {
    return this._useCases.checkIdentifier.execute(identifier)
  }

  checkUsername(username: string) {
    return this._useCases.checkUsername.execute(username)
  }

  getSessions(userId: string) {
    return this._useCases.getAuthSessions.execute(userId)
  }

  revokeSession(userId: string, sessionId: string) {
    return this._useCases.revokeAuthSession.execute(userId, sessionId)
  }

  generateTokenPair(
    userId: string,
    role: AuthRole,
    meta?: RequestMeta
  ): Promise<TokenPair> {
    return this._helpers.authSessionService.issueTokenPair(userId, role, meta)
  }

  generateTwoFactorChallengeToken(userId: string): string {
    return this._helpers.authTokenService.generateTwoFactorChallengeToken(userId)
  }

  generateOtp(): string {
    return this._helpers.otpGenerator.generate()
  }

  generateRegistrationUsername(data: {
    email?: string
    fullName: string
  }) {
    return this._helpers.usernameGenerator.generateRegistrationUsername(data)
  }

  generateUsername(fullName: string) {
    return this._helpers.usernameGenerator.generateUsername(fullName)
  }

  generateUniqueUsernameFromSource(source: string) {
    return this._helpers.usernameGenerator.generateUniqueUsernameFromSource(source)
  }

  formatter(user: AuthUserMapperInput) {
    return this._helpers.authUserMapper.toAuthUser(user)
  }
}

export const authService = new AuthService(createAuthComposition())

export type { OAuthLoginUser } from './application/dtos/auth.dto'