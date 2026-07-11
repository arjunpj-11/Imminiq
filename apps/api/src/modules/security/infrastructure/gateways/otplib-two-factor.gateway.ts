import * as QRCode from 'qrcode'
import { generateSecret, generateURI, verify } from 'otplib'

import {
  decryptTotpSecret,
  encryptTotpSecret,
} from '../../../../infrastructure/security/two-factor-secret.crypto'
import { SecurityDomainError } from '../../domain/errors/security-domain.error'
import type {
  ITwoFactorGateway,
  TwoFactorProvisioning,
} from '../../domain/services/two-factor-gateway.interface'

export class OtplibTwoFactorGateway
  implements ITwoFactorGateway
{
  async createSetup(data: {
    issuer: string
    accountLabel: string
  }): Promise<TwoFactorProvisioning> {
    try {
      const secret = generateSecret()

      const qrCodeUri = generateURI({
        issuer: data.issuer,
        label: data.accountLabel,
        secret,
      })

      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUri)

      return {
        secret,
        qrCodeUri,
        qrCodeDataUrl,
      }
    } catch {
      throw new SecurityDomainError(
        'TWO_FACTOR_SETUP_GENERATION_FAILED',
        'Two-factor setup generation failed',
      )
    }
  }

  async verifyToken(data: {
    encryptedSecret: string
    token: string
  }): Promise<boolean> {
    try {
      const secret = decryptTotpSecret(data.encryptedSecret)

      const verification = await verify({
        secret,
        token: data.token,
      })

      return verification.valid
    } catch {
      throw new SecurityDomainError(
        'TWO_FACTOR_VERIFICATION_FAILED',
        'Two-factor verification failed',
      )
    }
  }

  encryptSecret(secret: string): string {
    try {
      return encryptTotpSecret(secret)
    } catch {
      throw new SecurityDomainError(
        'TWO_FACTOR_SECRET_ENCRYPTION_FAILED',
        'Two-factor secret encryption failed',
      )
    }
  }
}

export const otplibTwoFactorGateway =
  new OtplibTwoFactorGateway()
