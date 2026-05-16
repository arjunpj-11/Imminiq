// apps/api/src/modules/security/two-factor-secret.util.ts

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'crypto'
import { env } from '../../config/env'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

const getEncryptionKey = () => {
  return Buffer.from(env.TOTP_ENCRYPTION_KEY, 'hex')
}

export const encryptTotpSecret = (secret: string): string => {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv)

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
}

export const decryptTotpSecret = (payload: string): string => {
  const [ivBase64, authTagBase64, encryptedBase64] = payload.split('.')

  if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
    throw new Error('Invalid encrypted TOTP secret payload')
  }

  const iv = Buffer.from(ivBase64, 'base64')
  const authTag = Buffer.from(authTagBase64, 'base64')
  const encrypted = Buffer.from(encryptedBase64, 'base64')

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}