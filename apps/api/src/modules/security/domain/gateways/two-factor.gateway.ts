export interface TwoFactorProvisioning {
  secret: string
  qrCodeUri: string
  qrCodeDataUrl: string
}

export interface TwoFactorGateway {
  createSetup(data: {
    issuer: string
    accountLabel: string
  }): Promise<TwoFactorProvisioning>

  verifyToken(data: {
    encryptedSecret: string
    token: string
  }): Promise<boolean>

  encryptSecret(secret: string): string
}
