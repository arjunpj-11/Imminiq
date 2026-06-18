import {
  AVATAR_FOLDER,
  BANNER_FOLDER,
} from '../../domain/constants/uploads.constants'
import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { ProfileImageRepositoryContract } from '../../domain/repositories/profile-image.repository.interface'
import type { UploadRecordRepositoryContract } from '../../domain/repositories/upload-record.repository.interface'
import type { ProfileImageStorageServiceContract } from '../../domain/services/profile-image-storage.service.interface'
import type {
  UploadProfileImageInput,
  UploadProfileImageResult,
} from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'
import type { UploadsMapperContract } from '../mappers/uploads.mapper'
import type { UploadUserProfileServiceContract } from '../services/upload-user-profile.service'

type UploadProfileImageRepository =
  ProfileImageRepositoryContract & UploadRecordRepositoryContract

export class UploadProfileImageUseCase {
  constructor(
    private readonly uploadUserProfileService: UploadUserProfileServiceContract,
    private readonly profileImageStorageService: ProfileImageStorageServiceContract,
    private readonly uploadsRepository: UploadProfileImageRepository,
    private readonly uploadsMapper: UploadsMapperContract,
  ) {}

  async execute(
    input: UploadProfileImageInput,
  ): Promise<UploadProfileImageResult> {
    if (!input.file) {
      throw UploadsApplicationError.imageFileRequired()
    }

    const context =
      await this.uploadUserProfileService.getRequiredContext(input.userId)
    const folder = input.kind === 'avatar' ? AVATAR_FOLDER : BANNER_FOLDER

    let storedImage

    try {
      storedImage = await this.profileImageStorageService.uploadProfileImage(
        input.file,
        folder,
      )
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw UploadsApplicationError.imageUploadFailed()
      }

      throw error
    }

    try {
      if (input.kind === 'avatar') {
        await this.uploadsRepository.setAvatarUrl(
          context.userId,
          storedImage.fileUrl,
        )
      } else {
        await this.uploadsRepository.setBannerUrl(
          context.userId,
          storedImage.fileUrl,
        )
      }

      const upload = await this.uploadsRepository.saveUploadRecord(
        context.userId,
        input.kind,
        storedImage,
        context.profileId,
      )

      return this.uploadsMapper.toUploadProfileImageResult(upload)
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw UploadsApplicationError.profileImageUpdateFailed()
      }

      throw error
    }
  }
}
