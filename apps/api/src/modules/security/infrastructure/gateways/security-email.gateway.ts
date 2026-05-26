import { sendMail } from '../../../../infrastructure/email/email.client'
import {
  emailChangeAlertTemplate,
  emailChangeVerificationTemplate,
} from '../../../../shared/email/email.templates'

import type {
  EmailChangeAlertTemplateInput,
  EmailChangeVerificationTemplateInput,
  SecurityEmailGateway,
} from '../../domain/services/security-email.service.interface'

export const securityEmailGateway: SecurityEmailGateway = {
  async sendEmailChangeVerification(
    to: string,
    input: EmailChangeVerificationTemplateInput
  ) {
    await sendMail(
      to,
      'Verify your new Imminiq email address',
      emailChangeVerificationTemplate(input)
    )
  },

  async sendEmailChangeAlert(
    to: string,
    input: EmailChangeAlertTemplateInput
  ) {
    await sendMail(
      to,
      'Imminiq email change requested',
      emailChangeAlertTemplate(input)
    )
  },
}
