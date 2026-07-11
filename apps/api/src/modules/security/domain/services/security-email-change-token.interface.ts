export interface EmailChangeTokenResult {
  rawToken: string
  tokenHash: string
  expiresAt: Date
}

export interface SecurityEmailChangeTokenContract {
  generate(): EmailChangeTokenResult
  hash(rawToken: string): string
}
