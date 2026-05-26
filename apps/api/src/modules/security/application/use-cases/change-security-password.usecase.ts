import type { SecurityPasswordGateway } from '../../domain/services/security-password.service.interface'
import type {
  ChangePasswordPayload,
  ChangePasswordResponse,
} from '../../domain/types/security.types'

export class ChangeSecurityPasswordUseCase {
  constructor(
    private readonly securityPasswordGateway: SecurityPasswordGateway
  ) {}

  async execute(
    userId: string,
    payload: ChangePasswordPayload
  ): Promise<ChangePasswordResponse> {
    await this.securityPasswordGateway.changePassword(
      userId,
      payload.currentPassword,
      payload.newPassword
    )

    return {
      sessionsRevoked: true,
    }
  }
}
