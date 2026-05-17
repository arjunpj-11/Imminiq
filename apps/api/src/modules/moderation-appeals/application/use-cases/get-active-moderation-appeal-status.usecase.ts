import type { GetModerationAppealStatusPayload } from '../../moderation-appeal.schema'
import type { ModerationAppealRepository } from '../../domain/repositories/moderation-appeal.repository.interface'
import type { GetActiveModerationAppealStatusResult } from '../../domain/types/moderation-appeal.types'

export class GetActiveModerationAppealStatusUseCase {
  constructor(
    private readonly moderationAppealRepository: ModerationAppealRepository
  ) {}

  async execute(
    payload: GetModerationAppealStatusPayload
  ): Promise<GetActiveModerationAppealStatusResult> {
    const appeal =
      await this.moderationAppealRepository.findLatestActiveAppealForRestrictedIdentifier(
        payload.identifier
      )

    if (!appeal) {
      return {
        exists: false,
        appeal: null,
      }
    }

    return {
      exists: true,
      appeal: {
        caseId: appeal.caseId,
        status: appeal.status,
        submittedAt: appeal.createdAt,
        appealReason: appeal.appealReason,
      },
    }
  }
}
