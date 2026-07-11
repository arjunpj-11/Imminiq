import type { ModerationAppealCommandRepositoryContract } from '../../domain/repositories/moderation-appeal-command.repository.interface'
import type { ModerationAppealQueryRepositoryContract } from '../../domain/repositories/moderation-appeal-query.repository.interface'
import type {
  SubmitModerationAppealPayload,
  SubmitModerationAppealResultDto,
} from '../dtos/moderation-appeal.dto'
import type { ModerationAppealMapperContract } from '../mappers/moderation-appeal.mapper'
import type { ModerationAppealSubmissionPolicyContract } from '../policies/moderation-appeal-submission-policy.policy'
import type { ModerationAppealCaseIdAllocatorContract } from '../services/moderation-appeal-case-id.service'

type SubmitModerationAppealRepository =
  ModerationAppealQueryRepositoryContract &
  ModerationAppealCommandRepositoryContract

export class SubmitModerationAppealUseCase {
  constructor(
    private readonly _moderationAppealRepository: SubmitModerationAppealRepository,
    private readonly _caseIdAllocator: ModerationAppealCaseIdAllocatorContract,
    private readonly _moderationAppealSubmissionPolicy: ModerationAppealSubmissionPolicyContract,
    private readonly _moderationAppealMapper: ModerationAppealMapperContract,
  ) {}

  async execute(
    payload: SubmitModerationAppealPayload,
  ): Promise<SubmitModerationAppealResultDto> {
    const user =
      await this._moderationAppealRepository.findRestrictedUserByIdentifier(
        payload.identifier,
      )

    this._moderationAppealSubmissionPolicy.ensureRestrictedUserExists(user)

    if (user.id !== payload.userId) {
      throw new Error('Appeal authorization does not match account')
    }

    const existingAppeal =
      await this._moderationAppealRepository.findActiveAppealForUser(user.id)

    this._moderationAppealSubmissionPolicy.ensureNoActiveAppeal(existingAppeal)

    const caseId =
      await this._caseIdAllocator.generateUniqueCaseId()

    const appeal = await this._moderationAppealRepository.createAppeal({
      userId: user.id,
      caseId,
      identifier: payload.identifier,
      appealReason: payload.appealReason,
    })

    return this._moderationAppealMapper.toSubmitResult(appeal)
  }
}
