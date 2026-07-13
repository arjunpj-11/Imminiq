import type { OtpPurpose } from '../value-objects/otp-purpose.vo';
import type { ParsedIdentifier } from '../value-objects/parsed-identifier.vo';
import type { VerificationMethod } from '../value-objects/verification-method.vo';

export interface IIdentifierNormalizer {
  isEmailIdentifier(identifier: string): boolean;
  normalize(identifier: string): ParsedIdentifier;
  getVerificationPurpose(method: VerificationMethod): OtpPurpose;
}
