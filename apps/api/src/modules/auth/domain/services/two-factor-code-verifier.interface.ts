export interface ITwoFactorCodeVerifier {
  verifyTotp(data: { encryptedSecret: string; token: string }): Promise<boolean>;
}
