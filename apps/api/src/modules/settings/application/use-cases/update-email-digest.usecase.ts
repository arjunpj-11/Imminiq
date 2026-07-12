import type { ISettingsCommandRepository } from '../../domain/repositories/settings-command.repository.interface'
import type {
  IUpdateEmailDigestPayloadDTO,
  UserSettingsViewDTO,
} from '../dtos/settings.dto'
import type { ISettingsMapper } from '../mappers/settings.mapper'

type UpdateEmailDigestRepository = {
  updateEmailDigest: ISettingsCommandRepository['updateEmailDigest']
}

export interface IUpdateEmailDigestUseCase {
  execute(userId: string, payload: IUpdateEmailDigestPayloadDTO): Promise<UserSettingsViewDTO | null>
}

export class UpdateEmailDigestUseCase implements IUpdateEmailDigestUseCase {
  constructor(
    private readonly _settingsRepository: UpdateEmailDigestRepository,
    private readonly _settingsMapper: ISettingsMapper,
  ) {}

  async execute(
    userId: string,
    payload: IUpdateEmailDigestPayloadDTO,
  ): Promise<UserSettingsViewDTO | null> {
    const settings = await this._settingsRepository.updateEmailDigest({
      userId,
      data: payload,
    })

    return this._settingsMapper.toNullableDto(settings)
  }
}