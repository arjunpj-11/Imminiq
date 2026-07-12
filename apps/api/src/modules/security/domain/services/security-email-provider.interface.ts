export type EmailChangeVerificationTemplateInput = {
  fullName: string
  newEmail: string
  verificationUrl: string
  expiresMinutes: number
}

export type EmailChangeAlertTemplateInput = {
  fullName: string
  requestedNewEmail: string
}

export interface ISecurityEmailProvider {
  sendEmailChangeVerification(
    to: string,
    input: EmailChangeVerificationTemplateInput,
  ): Promise<void>
  sendEmailChangeAlert(
    to: string,
    input: EmailChangeAlertTemplateInput,
  ): Promise<void>
}
