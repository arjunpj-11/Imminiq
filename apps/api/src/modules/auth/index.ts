export { authService } from './auth.service'
export type { AuthService } from './auth.service'

export type {
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

export type {
  AuthRole,
  LoginRedirectPath,
  OAuthProvider,
  OtpPurpose,
  UserStatus,
  VerificationMethod,
} from './domain/types/auth.types'
