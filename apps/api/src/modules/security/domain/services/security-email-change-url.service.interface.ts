export interface SecurityEmailChangeUrlServiceContract {
  buildVerificationUrl(rawToken: string): string
}
