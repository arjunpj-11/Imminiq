import type { ModerationAppealQueryRepositoryContract } from '../../domain/repositories/moderation-appeal-query.repository.interface'
import type {
  GetActiveModerationAppealStatusResultDto,
  GetModerationAppealStatusPayload,
} from '../dtos/moderation-appeal.dto'
import type { ModerationAppealMapperContract } from '../mappers/moderation-appeal.mapper'

export class GetActiveModerationAppealStatusUseCase {
  constructor(
    private readonly moderationAppealRepository: ModerationAppealQueryRepositoryContract,
    private readonly moderationAppealMapper: ModerationAppealMapperContract,
  ) {}

  async execute(
    payload: GetModerationAppealStatusPayload,
  ): Promise<GetActiveModerationAppealStatusResultDto> {
    const appeal =
      await this.moderationAppealRepository.findLatestActiveAppealForRestrictedIdentifier(
        payload.identifier,
      )

    return this.moderationAppealMapper.toActiveStatusResult(appeal)
  }
}
