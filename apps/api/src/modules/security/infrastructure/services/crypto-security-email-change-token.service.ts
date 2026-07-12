import { createHash, randomBytes } from 'crypto'

import { EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES } from '../../domain/constants/security.constants'
import { SecurityDomainError } from '../../domain/errors/security-domain.error'
import type {
  IEmailChangeTokenResult,
  ISecurityEmailChangeToken,
} from '../../domain/services/security-email-change-token.interface'

export class CryptoSecurityEmailChangeToken implements ISecurityEmailChangeToken {
  generate(): IEmailChangeTokenResult {
    try {
      const rawToken = randomBytes(32).toString('hex')

      return {
        rawToken,
        tokenHash: this.hash(rawToken),
        expiresAt: new Date(
          Date.now() + EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES * 60 * 1000,
        ),
      }
    } catch (error) {
      if (error instanceof SecurityDomainError) {
        throw error
      }

      throw new SecurityDomainError(
        'EMAIL_CHANGE_TOKEN_GENERATION_FAILED',
        'Email change token generation failed',
      )
    }
  }

  hash(rawToken: string): string {
    try {
      return createHash('sha256').update(rawToken).digest('hex')
    } catch {
      throw new SecurityDomainError(
        'EMAIL_CHANGE_TOKEN_HASH_FAILED',
        'Email change token hashing failed',
      )
    }
  }
}

export const cryptoSecurityEmailChangeToken =
  new CryptoSecurityEmailChangeToken()
