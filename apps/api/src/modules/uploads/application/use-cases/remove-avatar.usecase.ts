import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { IProfileImageRepository } from '../../domain/repositories/profile-image.repository.interface'
import type { IUploadRecordRepository } from '../../domain/repositories/upload-record.repository.interface'
import type { IRemoveAvatarResultDTO } from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'
import type { IUploadsMapper } from '../mappers/uploads.mapper'
import type { IUploadUserProfileReader } from '../services/upload-user-profile.service'

type RemoveAvatarRepository =
  IProfileImageRepository & IUploadRecordRepository

export class RemoveAvatarUseCase {
  constructor(
    private readonly _userProfileReader: IUploadUserProfileReader,
    private readonly _uploadsRepository: RemoveAvatarRepository,
    private readonly _uploadsMapper: IUploadsMapper,
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

      return this._uploadsMapper.toAvatarRemovedResult()
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw UploadsApplicationError.profileImageUpdateFailed()
      }

      throw error
    }
  }
}