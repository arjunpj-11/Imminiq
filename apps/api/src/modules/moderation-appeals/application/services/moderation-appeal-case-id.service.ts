import {
  MODERATION_APPEAL_CASE_ID_GENERATION_MAX_ATTEMPTS,
} from '../constants/moderation-appeal.constants'
import type { ModerationAppealQueryRepositoryContract } from '../../domain/repositories/moderation-appeal-query.repository.interface'
import type { ModerationAppealCaseIdGeneratorContract } from '../../domain/services/case-id-generator.service.interface'
import { ModerationAppealApplicationError } from '../errors/moderation-appeal-application.error'

export interface ModerationAppealCaseIdServiceContract {
  generateUniqueCaseId(): Promise<string>
}

export class ModerationAppealCaseIdService
  implements ModerationAppealCaseIdServiceContract
{
  constructor(
    private readonly moderationAppealRepository: ModerationAppealQueryRepositoryContract,
    private readonly caseIdGenerator: ModerationAppealCaseIdGeneratorContract,
  ) {}

  async generateUniqueCaseId(): Promise<string> {
    for (
      let attempt = 0;
      attempt < MODERATION_APPEAL_CASE_ID_GENERATION_MAX_ATTEMPTS;
      attempt += 1
    ) {
      const caseId = this.caseIdGenerator.generate()
      const exists = await this.moderationAppealRepository.caseIdExists(caseId)

      if (!exists) {
        return caseId
      }
    }

    throw ModerationAppealApplicationError.appealCaseIdGenerationFailed()
  }
}
