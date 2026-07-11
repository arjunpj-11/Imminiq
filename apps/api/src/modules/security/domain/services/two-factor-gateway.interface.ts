export type TwoFactorProvisioning = {
  secret: string
  qrCodeUri: string
  qrCodeDataUrl: string
}

export interface ITwoFactorGateway {
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
