import { randomInt } from 'crypto'
import {
  MODERATION_APPEAL_CASE_ID_MAX_RANDOM,
  MODERATION_APPEAL_CASE_ID_MIN_RANDOM,
  MODERATION_APPEAL_CASE_ID_PREFIX,
} from '../../domain/constants/moderation-appeal.constants'
import type { ModerationAppealCaseIdGeneratorContract } from '../../domain/services/case-id-generator.interface'

export class CryptoModerationAppealCaseIdGenerator
  implements ModerationAppealCaseIdGeneratorContract
{
  generate(): string {
    const randomPart = randomInt(
      MODERATION_APPEAL_CASE_ID_MIN_RANDOM,
      MODERATION_APPEAL_CASE_ID_MAX_RANDOM,
    ).toString()

    return `${MODERATION_APPEAL_CASE_ID_PREFIX}-${randomPart}`
  }
}

export const cryptoModerationAppealCaseIdGenerator =
  new CryptoModerationAppealCaseIdGenerator()
