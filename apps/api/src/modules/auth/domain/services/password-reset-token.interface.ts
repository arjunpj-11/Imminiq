import type { ResetTokenPayload } from '../value-objects/token-payload.vo'

export interface PasswordResetTokenContract {
  generate(userId: string): Promise<string>
  verify(resetToken: string): ResetTokenPayload
}
