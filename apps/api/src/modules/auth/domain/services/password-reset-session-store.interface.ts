export interface PasswordResetSessionStoreContract {
  save(jti: string, userId: string, ttlSeconds: number): Promise<void>
  consume(jti: string): Promise<string | null>
}
