import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { ProfileImageRepositoryContract } from '../../domain/repositories/profile-image.repository.interface'
import type { UploadRecordRepositoryContract } from '../../domain/repositories/upload-record.repository.interface'
import type { RemoveBannerResult } from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'
import type { UploadsMapperContract } from '../mappers/uploads.mapper'
import type { UploadUserProfileReaderContract } from '../services/upload-user-profile.service'

type RemoveBannerRepository =
  ProfileImageRepositoryContract & UploadRecordRepositoryContract

export class RemoveBannerUseCase {
  constructor(
    private readonly _userProfileReader: UploadUserProfileReaderContract,
    private readonly _uploadsRepository: RemoveBannerRepository,
    private readonly _uploadsMapper: UploadsMapperContract,
  ) {}

  async execute(userId: string): Promise<RemoveBannerResult> {
    const context =
      await this._userProfileReader.getRequiredContext(userId)

    try {
      await Promise.all([
        this._uploadsRepository.clearBannerUrl(context.userId),
        this._uploadsRepository.softDeleteLatestProfileUpload({
          userId: context.userId,
          kind: 'banner',
        }),
      ])

      return this._uploadsMapper.toBannerRemovedResult()
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw UploadsApplicationError.profileImageUpdateFailed()
      }

      throw error
    }
  }
}