export interface IRefreshTokenHasher {
  hash(rawToken: string): string
}
