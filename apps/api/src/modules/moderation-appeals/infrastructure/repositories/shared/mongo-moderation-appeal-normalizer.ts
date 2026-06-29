import type { NormalizedIdentifier } from './mongo-moderation-appeal.types'

export class MongoModerationAppealNormalizer {
  private constructor() {}

  static text(value: string): string {
    return value.trim()
  }

  static phone(phone: string): string {
    return phone.trim().replace(/\s/g, '')
  }

  static identifier(identifier: string): NormalizedIdentifier {
    const value = MongoModerationAppealNormalizer.text(identifier)
    const isEmail = value.includes('@')

    return {
      value: isEmail
        ? value.toLowerCase()
        : MongoModerationAppealNormalizer.phone(value),
      isEmail,
    }
  }
}
