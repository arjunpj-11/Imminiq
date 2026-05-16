// apps/api/src/modules/security/email-change-token.util.ts

import { createHash, randomBytes } from 'crypto'

export const EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES = 10

export const generateEmailChangeToken = () => {
  const rawToken = randomBytes(32).toString('hex')

  const tokenHash = createHash('sha256')
    .update(rawToken)
    .digest('hex')

  const expiresAt = new Date(
    Date.now() + EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES * 60 * 1000
  )

  return {
    rawToken,
    tokenHash,
    expiresAt,
  }
}

export const hashEmailChangeToken = (rawToken: string) => {
  return createHash('sha256')
    .update(rawToken)
    .digest('hex')
}