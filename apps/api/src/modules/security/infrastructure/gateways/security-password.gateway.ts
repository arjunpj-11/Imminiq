import { authService } from '../../../auth'
import type { SecurityPasswordGateway } from '../../domain/services/security-password.service.interface'

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
