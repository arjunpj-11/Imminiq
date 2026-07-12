import type { IModerationAppealQueryRepository } from '../../domain/repositories/moderation-appeal-query.repository.interface'
import type {
  IGetActiveModerationAppealStatusResultDTO,
  IGetModerationAppealStatusPayloadDTO,
} from '../dtos/moderation-appeal.dto'
import type { IModerationAppealMapper } from '../mappers/moderation-appeal.mapper'

export interface IGetActiveModerationAppealStatusUseCase {
  execute(payload: IGetModerationAppealStatusPayloadDTO): Promise<IGetActiveModerationAppealStatusResultDTO>
}

export class GetActiveModerationAppealStatusUseCase implements IGetActiveModerationAppealStatusUseCase {
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
