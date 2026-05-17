export interface EmailChangeVerificationTemplateInput {
  fullName: string
  newEmail: string
  verificationUrl: string
  expiresMinutes: number
}

export interface EmailChangeAlertTemplateInput {
  fullName: string
  requestedNewEmail: string
}

export interface SecurityEmailGateway {
  sendEmailChangeVerification(
    to: string,
    input: EmailChangeVerificationTemplateInput
  ): Promise<void>

  sendEmailChangeAlert(
    to: string,
    input: EmailChangeAlertTemplateInput
  ): Promise<void>
}
