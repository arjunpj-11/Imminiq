import { authService } from '../../../auth/auth.service'
import type { SecurityPasswordGateway } from '../../domain/gateways/security-password.gateway'

export const securityPasswordGateway: SecurityPasswordGateway = {
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    )
  },
}
