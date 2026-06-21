export type TwoFactorProvisioning = {
  secret: string
  qrCodeUri: string
  qrCodeDataUrl: string
}

export interface TwoFactorGatewayContract {
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
