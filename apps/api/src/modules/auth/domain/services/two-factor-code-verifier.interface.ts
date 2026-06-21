export interface TwoFactorCodeVerifierContract {
  verifyTotp(data: {
    encryptedSecret: string
    token: string
  }): Promise<boolean>
}
