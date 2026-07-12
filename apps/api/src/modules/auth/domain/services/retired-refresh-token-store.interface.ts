export type RetiredRefreshTokenRecord = {
  userId: string
  sessionId: string
}

export interface IRetiredRefreshTokenStore {
  findByRawToken(refreshToken: string): Promise<RetiredRefreshTokenRecord | null>
  retire(data: {
    refreshTokenHash: string
    userId: string
    sessionId: string
    expiresAt: Date
  }): Promise<void>
}
