import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'crypto'

import { env } from '../../config/env'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const EXPECTED_KEY_LENGTH = 32

export type TwoFactorSecretCryptoErrorCode =
  | 'INVALID_ENCRYPTED_PAYLOAD'
  | 'INVALID_ENCRYPTION_KEY'
  | 'ENCRYPTION_FAILED'
  | 'DECRYPTION_FAILED'

export class TwoFactorSecretCryptoError extends Error {
  readonly code: TwoFactorSecretCryptoErrorCode

  constructor(
    code: TwoFactorSecretCryptoErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'TwoFactorSecretCryptoError'
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}

export class TwoFactorSecretCrypto {
  encrypt(secret: string): string {
    try {
      const iv = randomBytes(IV_LENGTH)

      const cipher = createCipheriv(
        ALGORITHM,
        this.getEncryptionKey(),
        iv,
      )

      const encrypted = Buffer.concat([
        cipher.update(secret, 'utf8'),
        cipher.final(),
      ])

      const authTag = cipher.getAuthTag()

      return [
        iv.toString('base64'),
        authTag.toString('base64'),
        encrypted.toString('base64'),
      ].join('.')
    } catch (error) {
      if (error instanceof TwoFactorSecretCryptoError) {
        throw error
      }

      throw new TwoFactorSecretCryptoError(
        'ENCRYPTION_FAILED',
        'Failed to encrypt two-factor secret',
      )
    }
  }

  decrypt(payload: string): string {
    const [ivBase64, authTagBase64, encryptedBase64] =
      payload.split('.')

    if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
      throw new TwoFactorSecretCryptoError(
        'INVALID_ENCRYPTED_PAYLOAD',
        'Encrypted two-factor secret payload is invalid',
      )
    }

    try {
      const decipher = createDecipheriv(
        ALGORITHM,
        this.getEncryptionKey(),
        Buffer.from(ivBase64, 'base64'),
      )

      decipher.setAuthTag(
        Buffer.from(authTagBase64, 'base64'),
      )

      return Buffer.concat([
        decipher.update(
          Buffer.from(encryptedBase64, 'base64'),
        ),
        decipher.final(),
      ]).toString('utf8')
    } catch (error) {
      if (error instanceof TwoFactorSecretCryptoError) {
        throw error
      }

      throw new TwoFactorSecretCryptoError(
        'DECRYPTION_FAILED',
        'Failed to decrypt two-factor secret',
      )
    }
  }

  private getEncryptionKey(): Buffer {
    const key = Buffer.from(
      env.TOTP_ENCRYPTION_KEY,
      'hex',
    )

    if (key.length !== EXPECTED_KEY_LENGTH) {
      throw new TwoFactorSecretCryptoError(
        'INVALID_ENCRYPTION_KEY',
        'TOTP_ENCRYPTION_KEY must be a 64-character hexadecimal string',
      )
    }

    return key
  }
}

export const twoFactorSecretCrypto =
  new TwoFactorSecretCrypto()

export const encryptTotpSecret = (
  secret: string,
): string => twoFactorSecretCrypto.encrypt(secret)

export const decryptTotpSecret = (
  encryptedSecret: string,
): string => twoFactorSecretCrypto.decrypt(encryptedSecret)