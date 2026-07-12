import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { IProfileImageRepository } from '../../domain/repositories/profile-image.repository.interface'
import type { IUploadRecordRepository } from '../../domain/repositories/upload-record.repository.interface'
import type { IRemoveAvatarResultDTO } from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'
import type { IUploadUserProfileReader } from '../services/upload-user-profile.service'

type RemoveAvatarRepository =
  IProfileImageRepository & IUploadRecordRepository

export interface IRemoveAvatarUseCase {
  execute(userId: string): Promise<IRemoveAvatarResultDTO>
}

export class RemoveAvatarUseCase implements IRemoveAvatarUseCase {
  constructor(
    private readonly _userProfileReader: IUploadUserProfileReader,
    private readonly _uploadsRepository: RemoveAvatarRepository,
  ) {}

  async execute(userId: string): Promise<IRemoveAvatarResultDTO> {
    const context =
      await this._userProfileReader.getRequiredContext(userId)

    try {
      await Promise.all([
        this._uploadsRepository.clearAvatarUrl(context.userId),
        this._uploadsRepository.softDeleteLatestProfileUpload({
          userId: context.userId,
          kind: 'avatar',
        }),
      ])

      return {
        avatarRemoved: true,
        defaultAvatarApplied: true,
      }
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw UploadsApplicationError.profileImageUpdateFailed()
      }

      throw error
    }
  }
}
