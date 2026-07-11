export interface IEmailChangeTokenResult {
  rawToken: string
  tokenHash: string
  expiresAt: Date
}

export interface ISecurityEmailChangeToken {
  generate(): IEmailChangeTokenResult
  hash(rawToken: string): string
}
