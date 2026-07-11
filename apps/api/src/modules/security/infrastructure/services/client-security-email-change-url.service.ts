import { env } from '../../../../config/env'
import type { SecurityEmailChangeUrlBuilderContract } from '../../domain/services/security-email-change-url.interface'

export class ClientSecurityEmailChangeUrlBuilder implements SecurityEmailChangeUrlBuilderContract {
  buildVerificationUrl(rawToken: string): string {
    return `${env.CLIENT_URL}/verify-email-change?token=${rawToken}`
  }
}

export const clientSecurityEmailChangeUrlBuilder =
  new ClientSecurityEmailChangeUrlBuilder()
