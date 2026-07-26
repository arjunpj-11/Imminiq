import type { IModerationAppealQueryRepository } from '../../domain/repositories/moderation-appeal-query.repository.interface';
import type {
  GetActiveModerationAppealStatusResultDTO,
  GetModerationAppealStatusPayloadDTO,
} from '../moderation-appeal.dto';
import type { IModerationAppealMapper } from '../moderation-appeal.mapper';

export interface IGetActiveModerationAppealStatusUseCase {
  execute(
    payload: GetModerationAppealStatusPayloadDTO
  ): Promise<GetActiveModerationAppealStatusResultDTO>;
}

export class GetActiveModerationAppealStatusUseCase implements IGetActiveModerationAppealStatusUseCase {
  constructor(
    private readonly _moderationAppealRepository: IModerationAppealQueryRepository,
    private readonly _moderationAppealMapper: IModerationAppealMapper
  ) {}

  async execute(
    payload: GetModerationAppealStatusPayloadDTO
  ): Promise<GetActiveModerationAppealStatusResultDTO> {
    const appeal = await this._moderationAppealRepository.findActiveAppealForUser(payload.userId);

    return this._moderationAppealMapper.toActiveStatusResult(appeal);
  }
}
