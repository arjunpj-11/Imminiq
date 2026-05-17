import type {
  OtpPurpose,
  ParsedIdentifier,
  VerificationMethod,
} from '../../domain/types/auth.types'

export const isEmailIdentifier = (identifier: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(identifier.trim())
}

export const normalizeIdentifier = (
  identifier: string
): ParsedIdentifier => {
  const value = identifier.trim()

  if (isEmailIdentifier(value)) {
    return {
      email: value.toLowerCase(),
      phone: undefined,
      method: 'email',
      value: value.toLowerCase(),
    }
  }

  const normalizedPhone = value.replace(/\s/g, '')

  return {
    email: undefined,
    phone: normalizedPhone,
    method: 'phone',
    value: normalizedPhone,
  }
}

export const getVerificationPurpose = (
  method: VerificationMethod
): OtpPurpose => {
  return method === 'email'
    ? 'email_verification'
    : 'phone_verification'
}
