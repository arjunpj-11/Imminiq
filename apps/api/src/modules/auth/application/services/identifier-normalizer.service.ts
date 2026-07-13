import type { IIdentifierNormalizer } from '../../domain/services/identifier-normalizer.interface';
import type { OtpPurpose } from '../../domain/value-objects/otp-purpose.vo';
import type { ParsedIdentifier } from '../../domain/value-objects/parsed-identifier.vo';
import type { VerificationMethod } from '../../domain/value-objects/verification-method.vo';

export type { IIdentifierNormalizer };

export class IdentifierNormalizer implements IIdentifierNormalizer {
  isEmailIdentifier(identifier: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(identifier.trim());
  }

  normalize(identifier: string): ParsedIdentifier {
    const value = identifier.trim();

    if (this.isEmailIdentifier(value)) {
      return {
        email: value.toLowerCase(),
        phone: undefined,
        method: 'email',
        value: value.toLowerCase(),
      };
    }

    const normalizedPhone = value.replace(/\s/g, '');

    return {
      email: undefined,
      phone: normalizedPhone,
      method: 'phone',
      value: normalizedPhone,
    };
  }

  getVerificationPurpose(method: VerificationMethod): OtpPurpose {
    return method === 'email' ? 'email_verification' : 'phone_verification';
  }
}
