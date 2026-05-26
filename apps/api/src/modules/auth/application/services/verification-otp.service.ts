import type { AuthNotificationServiceContract } from '../../domain/services/auth-notification.service.interface'
import type { VerificationMethod } from '../../domain/types/auth.types'

/**
 * Compatibility helper. Concrete email/SMS implementation now lives in
 * infrastructure/auth-notification.service.ts and is injected by auth.service.ts.
 */
export const sendVerificationOtp = async (
  notificationService: AuthNotificationServiceContract,
  data: {
    email?: string
    phone?: string
    method: VerificationMethod
  }
) => {
  await notificationService.sendVerificationOtp(data)
}
