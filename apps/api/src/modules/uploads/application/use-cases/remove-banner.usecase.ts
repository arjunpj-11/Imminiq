import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { ProfileImageRepositoryContract } from '../../domain/repositories/profile-image.repository.interface'
import type { UploadRecordRepositoryContract } from '../../domain/repositories/upload-record.repository.interface'
import type { RemoveBannerResult } from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'
import type { UploadsMapperContract } from '../mappers/uploads.mapper'
import type { UploadUserProfileServiceContract } from '../services/upload-user-profile.service'

type RemoveBannerRepository =
  ProfileImageRepositoryContract & UploadRecordRepositoryContract

export class RemoveBannerUseCase {
  constructor(
    private readonly uploadUserProfileService: UploadUserProfileServiceContract,
    private readonly uploadsRepository: RemoveBannerRepository,
    private readonly uploadsMapper: UploadsMapperContract,
  ) {}

  async execute(userId: string): Promise<RemoveBannerResult> {
    const context =
      await this.uploadUserProfileService.getRequiredContext(userId)

    try {
      await Promise.all([
        this.uploadsRepository.clearBannerUrl(context.userId),
        this.uploadsRepository.softDeleteLatestProfileUpload({
          userId: context.userId,
          kind: 'banner',
        }),
      ])

      return this.uploadsMapper.toBannerRemovedResult()
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw UploadsApplicationError.profileImageUpdateFailed()
      }

      throw error
    }
  }
}