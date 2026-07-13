import type { VerificationMethod } from './verification-method.vo';

export type ParsedIdentifier = {
  email?: string;
  phone?: string;
  method: VerificationMethod;
  value: string;
};
