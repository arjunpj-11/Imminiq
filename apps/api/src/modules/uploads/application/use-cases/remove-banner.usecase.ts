import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { IProfileImageRepository } from '../../domain/repositories/profile-image.repository.interface'
import type { IUploadRecordRepository } from '../../domain/repositories/upload-record.repository.interface'
import type { IRemoveBannerResultDTO } from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'
import type { IUploadsMapper } from '../mappers/uploads.mapper'
import type { IUploadUserProfileReader } from '../services/upload-user-profile.service'

type RemoveBannerRepository =
  IProfileImageRepository & IUploadRecordRepository

export class RemoveBannerUseCase {
  constructor(
    private readonly _userProfileReader: IUploadUserProfileReader,
    private readonly _uploadsRepository: RemoveBannerRepository,
    private readonly _uploadsMapper: IUploadsMapper,
  ) {}

  async execute(userId: string): Promise<IRemoveBannerResultDTO> {
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