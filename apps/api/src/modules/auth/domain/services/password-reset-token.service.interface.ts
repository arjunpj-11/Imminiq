import type { ResetTokenPayload } from '../value-objects/token-payload.vo'

export interface PasswordResetTokenServiceContract {
  generate(userId: string): Promise<string>
  verify(resetToken: string): ResetTokenPayload
}
