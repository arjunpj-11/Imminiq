export interface EmailChangeTokenResult {
  rawToken: string
  tokenHash: string
  expiresAt: Date
}

export interface SecurityEmailChangeTokenServiceContract {
  generate(): EmailChangeTokenResult
  hash(rawToken: string): string
}
