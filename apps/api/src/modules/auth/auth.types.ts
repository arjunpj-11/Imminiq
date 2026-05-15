export type AuthRole = 'user' | 'admin' | 'moderator' | 'superadmin'

export type UserStatus =
  | 'active'
  | 'paused'
  | 'blocked'
  | 'deactivated'
  | 'banned'

export type VerificationMethod = 'email' | 'phone'

export interface RegisterPayload {
  fullName: string
  identifier: string
  password: string
}

export interface LoginPayload {
  identifier: string
  password: string
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

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: AuthUser
    tokens: TokenPair
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