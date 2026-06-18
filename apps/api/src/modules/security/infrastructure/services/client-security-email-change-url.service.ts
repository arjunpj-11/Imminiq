import { env } from '../../../../config/env'
import type { SecurityEmailChangeUrlServiceContract } from '../../domain/services/security-email-change-url.service.interface'

export class ClientSecurityEmailChangeUrlService implements SecurityEmailChangeUrlServiceContract {
  buildVerificationUrl(rawToken: string): string {
    return `${env.CLIENT_URL}/verify-email-change?token=${rawToken}`
  }
}

export const clientSecurityEmailChangeUrlService =
  new ClientSecurityEmailChangeUrlService()
