import { ApiError } from '../../../../shared/utils/ApiError'
import type { SubmitModerationAppealPayload } from '../../moderation-appeal.schema'
import type { ModerationAppealRepository } from '../../domain/repositories/moderation-appeal.repository.interface'
import type { SubmitModerationAppealResult } from '../../domain/types/moderation-appeal.types'
import { generateModerationAppealCaseId } from '../services/moderation-appeal-case-id.service'

export class SubmitModerationAppealUseCase {
  constructor(
    private readonly moderationAppealRepository: ModerationAppealRepository
  ) {}

  async execute(
    payload: SubmitModerationAppealPayload
  ): Promise<SubmitModerationAppealResult> {
    const user =
      await this.moderationAppealRepository.findRestrictedUserByIdentifier(
        payload.identifier
      )

    if (!user) {
      throw new ApiError(
        404,
        'No restricted account was found for this email or phone number.',
        'RESTRICTED_ACCOUNT_NOT_FOUND'
      )
    }

    const existingAppeal =
      await this.moderationAppealRepository.findActiveAppealForUser(
        user._id.toString()
      )

    if (existingAppeal) {
      throw new ApiError(
        409,
        'An appeal is already under review for this account.',
        'ACTIVE_APPEAL_ALREADY_EXISTS'
      )
    }

    const caseId = await generateModerationAppealCaseId(
      this.moderationAppealRepository
    )

    const appeal = await this.moderationAppealRepository.createAppeal({
      userId: user._id.toString(),
      caseId,
      identifier: payload.identifier,
      appealReason: payload.appealReason,
    })

    return {
      caseId: appeal.caseId,
      status: appeal.status,
      submittedAt: appeal.createdAt,
    }
  }
}
