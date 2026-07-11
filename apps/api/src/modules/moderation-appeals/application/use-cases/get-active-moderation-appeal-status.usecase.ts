import type { ModerationAppealQueryRepositoryContract } from '../../domain/repositories/moderation-appeal-query.repository.interface'
import type {
  GetActiveModerationAppealStatusResultDto,
  GetModerationAppealStatusPayload,
} from '../dtos/moderation-appeal.dto'
import type { ModerationAppealMapperContract } from '../mappers/moderation-appeal.mapper'

export class GetActiveModerationAppealStatusUseCase {
  constructor(
    private readonly _moderationAppealRepository: ModerationAppealQueryRepositoryContract,
    private readonly _moderationAppealMapper: ModerationAppealMapperContract,
  ) {}

  async execute(
    payload: GetModerationAppealStatusPayload,
  ): Promise<GetActiveModerationAppealStatusResultDto> {
    const appeal =
      await this._moderationAppealRepository.findActiveAppealForUser(payload.userId)

    return this._moderationAppealMapper.toActiveStatusResult(appeal)
  }
}
