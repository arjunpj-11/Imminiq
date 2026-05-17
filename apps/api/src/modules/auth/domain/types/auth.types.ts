export type AuthRole = 'user' | 'admin' | 'moderator' | 'superadmin'

export type UserStatus =
  | 'active'
  | 'paused'
  | 'blocked'
  | 'deactivated'
  | 'banned'

export type VerificationMethod = 'email' | 'phone'

export type LoginRedirectPath =
  | '/dashboard'
  | '/onboarding/step-1'

export type OtpPurpose =
  | 'email_verification'
  | 'phone_verification'
  | 'password_reset'

export interface RegisterPayload {
  fullName: string
  identifier: string
  password: string
}

export interface LoginPayload {
  identifier: string
  password: string
}

export interface TwoFactorLoginVerifyPayload {
  code: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  _id: string

  fullName: string
  username: string

  email?: string
  phone?: string

  role: AuthRole
  status: UserStatus

  emailVerified: boolean
  phoneVerified: boolean

  isPremium: boolean
  avatarUrl?: string | null

  onboardingCompleted: boolean
}

export interface JwtPayload {
  userId: string
  role: AuthRole
  type: 'access'
}

export interface AuthLoginSuccessResult {
  requiresTwoFactor: false
  tokens: TokenPair
  user: AuthUser
  redirectPath: LoginRedirectPath
}

export interface AuthTwoFactorChallengeResult {
  requiresTwoFactor: true
  challengeToken: string
  challengeExpiresInMinutes: number
}

export type AuthLoginResult =
  | AuthLoginSuccessResult
  | AuthTwoFactorChallengeResult

export interface AuthResponse {
  success: boolean
  message: string
  data:
    | {
        accessToken: string
        user: AuthUser
        redirectPath: LoginRedirectPath
      }
    | {
        requiresTwoFactor: true
        challengeExpiresInMinutes: number
      }
}

export interface RegisterResponse {
  success: boolean
  message: string
  data: {
    user: AuthUser
    verificationTarget: string
    verificationMethod: VerificationMethod
  }
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export type ResetTokenPayload = {
  userId: string
  purpose: 'password_reset'
}

export type TwoFactorChallengeTokenPayload = {
  userId: string
  purpose: 'two_factor_login'
}

export type RequestMeta = {
  device?: string
  ipAddress?: string
  userAgent?: string
}

export type ParsedIdentifier = {
  email?: string
  phone?: string
  method: VerificationMethod
  value: string
}

export type OAuthFormattedUserSource = Pick<
  AuthUser,
  | 'fullName'
  | 'username'
  | 'email'
  | 'phone'
  | 'role'
  | 'status'
  | 'emailVerified'
  | 'phoneVerified'
  | 'isPremium'
  | 'avatarUrl'
  | 'onboardingCompleted'
> & {
  _id: {
    toString(): string
  }
}

export type OAuthLoginUser = OAuthFormattedUserSource & {
  role: AuthRole
}
