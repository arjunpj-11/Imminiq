import { sendMail } from '../../../../infrastructure/email/email.client'
import {
  emailChangeAlertTemplate,
  emailChangeVerificationTemplate,
} from '../../../../shared/email/email.templates'
import { SecurityDomainError } from '../../domain/security-domain.error'
import type {
  EmailChangeAlertTemplateInput,
  EmailChangeVerificationTemplateInput,
  ISecurityEmailProvider,
} from '../../domain/services/security-email-provider.interface'

export class SharedSecurityEmailProvider implements ISecurityEmailProvider {
  async sendEmailChangeVerification(
    to: string,
    input: EmailChangeVerificationTemplateInput,
  ): Promise<void> {
    try {
      await sendMail(
        to,
        'Verify your new Imminiq email address',
        emailChangeVerificationTemplate(input),
      )
    } catch {
      throw new SecurityDomainError(
        'EMAIL_CHANGE_VERIFICATION_SEND_FAILED',
        'Email change verification could not be sent',
      )
    }
  }

  async sendEmailChangeAlert(
    to: string,
    input: EmailChangeAlertTemplateInput,
  ): Promise<void> {
    try {
      await sendMail(
        to,
        'Imminiq email change requested',
        emailChangeAlertTemplate(input),
      )
    } catch {
      throw new SecurityDomainError(
        'EMAIL_CHANGE_ALERT_SEND_FAILED',
        'Email change alert could not be sent',
      )
    }
  }
}

export const sharedSecurityEmailProvider = new SharedSecurityEmailProvider()
