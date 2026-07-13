import type { AuthRole } from './auth-role.vo'

export interface IJwtPayload {
  userId: string
  role: AuthRole
  type: 'access'
  sessionId?: string
}

export type ResetTokenPayload = {
  userId: string
  purpose: 'password_reset'
  jti: string
}

export type TwoFactorChallengeTokenPayload = {
  userId: string
  purpose: 'two_factor_login'
}
