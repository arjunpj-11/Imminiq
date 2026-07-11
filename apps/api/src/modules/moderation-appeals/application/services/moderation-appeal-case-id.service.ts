import {
  MODERATION_APPEAL_CASE_ID_GENERATION_MAX_ATTEMPTS,
} from '../constants/moderation-appeal.constants'
import type { IModerationAppealQueryRepository } from '../../domain/repositories/moderation-appeal-query.repository.interface'
import type { IModerationAppealCaseIdGenerator } from '../../domain/services/case-id-generator.interface'
import { ModerationAppealApplicationError } from '../errors/moderation-appeal-application.error'

export interface IModerationAppealCaseIdAllocator {
  generateUniqueCaseId(): Promise<string>
}

export class ModerationAppealCaseIdAllocator
  implements IModerationAppealCaseIdAllocator
{
  constructor(
    private readonly _moderationAppealRepository: IModerationAppealQueryRepository,
    private readonly _caseIdGenerator: IModerationAppealCaseIdGenerator,
  ) {}

  async generateUniqueCaseId(): Promise<string> {
    for (
      let attempt = 0;
      attempt < MODERATION_APPEAL_CASE_ID_GENERATION_MAX_ATTEMPTS;
      attempt += 1
    ) {
      const caseId = this._caseIdGenerator.generate()
      const exists = await this._moderationAppealRepository.caseIdExists(caseId)

      if (!exists) {
        return caseId
      }
    }

    throw ModerationAppealApplicationError.appealCaseIdGenerationFailed()
  }
}
