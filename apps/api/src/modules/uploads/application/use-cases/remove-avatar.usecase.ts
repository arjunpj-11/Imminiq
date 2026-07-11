import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { ProfileImageRepositoryContract } from '../../domain/repositories/profile-image.repository.interface'
import type { UploadRecordRepositoryContract } from '../../domain/repositories/upload-record.repository.interface'
import type { RemoveAvatarResult } from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'
import type { UploadsMapperContract } from '../mappers/uploads.mapper'
import type { UploadUserProfileReaderContract } from '../services/upload-user-profile.service'

type RemoveAvatarRepository =
  ProfileImageRepositoryContract & UploadRecordRepositoryContract

export class RemoveAvatarUseCase {
  constructor(
    private readonly _userProfileReader: UploadUserProfileReaderContract,
    private readonly _uploadsRepository: RemoveAvatarRepository,
    private readonly _uploadsMapper: UploadsMapperContract,
  ) {}

  async execute(userId: string): Promise<RemoveAvatarResult> {
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