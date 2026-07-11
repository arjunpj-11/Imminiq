import type { IModerationAppealQueryRepository } from '../../domain/repositories/moderation-appeal-query.repository.interface'
import type {
  IGetActiveModerationAppealStatusResultDTO,
  IGetModerationAppealStatusPayloadDTO,
} from '../dtos/moderation-appeal.dto'
import type { IModerationAppealMapper } from '../mappers/moderation-appeal.mapper'

export class GetActiveModerationAppealStatusUseCase {
  constructor(
    private readonly _moderationAppealRepository: IModerationAppealQueryRepository,
    private readonly _moderationAppealMapper: IModerationAppealMapper,
  ) {}

  async execute(
    payload: IGetModerationAppealStatusPayloadDTO,
  ): Promise<IGetActiveModerationAppealStatusResultDTO> {
    const appeal =
      await this._moderationAppealRepository.findActiveAppealForUser(payload.userId)

    return this._moderationAppealMapper.toActiveStatusResult(appeal)
  }
}
