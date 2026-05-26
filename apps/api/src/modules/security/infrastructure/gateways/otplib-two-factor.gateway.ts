import * as QRCode from 'qrcode'
import {
  generateSecret,
  generateURI,
  verify,
} from 'otplib'

import type {
  TwoFactorGateway,
  TwoFactorProvisioning,
} from '../../domain/services/two-factor.service.interface'
import {
  decryptTotpSecret,
  encryptTotpSecret,
} from '../crypto/two-factor-secret.crypto'

export const otplibTwoFactorGateway: TwoFactorGateway = {
  async createSetup(data: {
    issuer: string
    accountLabel: string
  }): Promise<TwoFactorProvisioning> {
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
  },

  async verifyToken(data: {
    encryptedSecret: string
    token: string
  }): Promise<boolean> {
    const secret = decryptTotpSecret(data.encryptedSecret)

    const verification = await verify({
      secret,
      token: data.token,
    })

    return verification.valid
  },

  encryptSecret(secret: string): string {
    return encryptTotpSecret(secret)
  },
}
