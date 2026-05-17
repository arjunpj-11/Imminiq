import crypto from 'crypto'

import { ApiError } from '../../../../shared/utils/ApiError'
import type { ModerationAppealRepository } from '../../domain/repositories/moderation-appeal.repository.interface'

export const generateModerationAppealCaseId = async (
  repository: ModerationAppealRepository
): Promise<string> => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const randomPart = crypto.randomInt(1000, 10000).toString()
    const caseId = `CASE-IQ-${randomPart}`

    const exists = await repository.caseIdExists(caseId)

    if (!exists) {
      return caseId
    }
  }

  throw new ApiError(
    500,
    'Unable to generate an appeal case ID. Please try again.',
    'APPEAL_CASE_ID_GENERATION_FAILED'
  )
}
