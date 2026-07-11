import type { AuthRole } from '../value-objects/auth-role.vo'
import type {
  TwoFactorChallengeTokenPayload,
} from '../value-objects/token-payload.vo'

export interface AuthTokenContract {
  generateAccessToken(userId: string, role: AuthRole): string
  generateRefreshToken(): string
  generateTwoFactorChallengeToken(userId: string): string
  verifyTwoFactorChallengeToken(
    challengeToken: string
  ): TwoFactorChallengeTokenPayload
}
