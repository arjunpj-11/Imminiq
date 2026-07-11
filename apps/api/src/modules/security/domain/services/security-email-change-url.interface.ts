export interface ISecurityEmailChangeUrlBuilder {
  buildVerificationUrl(rawToken: string): string
}
