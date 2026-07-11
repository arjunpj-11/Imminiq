import {
  AVATAR_FOLDER,
  BANNER_FOLDER,
} from '../../domain/constants/uploads.constants'
import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { ProfileImageRepositoryContract } from '../../domain/repositories/profile-image.repository.interface'
import type { UploadRecordRepositoryContract } from '../../domain/repositories/upload-record.repository.interface'
import type { ProfileImageStorageContract } from '../../domain/services/profile-image-storage.interface'
import type {
  UploadProfileImageInput,
  UploadProfileImageResult,
} from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'
import type { UploadsMapperContract } from '../mappers/uploads.mapper'
import type { UploadUserProfileReaderContract } from '../services/upload-user-profile.service'

type UploadProfileImageRepository =
  ProfileImageRepositoryContract & UploadRecordRepositoryContract

type StoredProfileImage = Awaited<
  ReturnType<ProfileImageStorageContract['uploadProfileImage']>
>

export class UploadProfileImageUseCase {
  constructor(
    private readonly _userProfileReader: UploadUserProfileReaderContract,
    private readonly _profileImageStorage: ProfileImageStorageContract,
    private readonly _uploadsRepository: UploadProfileImageRepository,
    private readonly _uploadsMapper: UploadsMapperContract,
  ) {}

  async execute(
    input: UploadProfileImageInput,
  ): Promise<UploadProfileImageResult> {
    if (!input.file) {
      throw UploadsApplicationError.imageFileRequired()
    }

    const context =
      await this._userProfileReader.getRequiredContext(input.userId)

    const folder = input.kind === 'avatar' ? AVATAR_FOLDER : BANNER_FOLDER

    let storedImage: StoredProfileImage

    try {
      storedImage = await this._profileImageStorage.uploadProfileImage(
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
        await this._uploadsRepository.setAvatarUrl({
          userId: context.userId,
          avatarUrl: storedImage.fileUrl,
        })
      } else {
        await this._uploadsRepository.setBannerUrl({
          userId: context.userId,
          bannerUrl: storedImage.fileUrl,
        })
      }

      const upload = await this._uploadsRepository.saveUploadRecord({
        userId: context.userId,
        kind: input.kind,
        file: storedImage,
        referenceId: context.profileId,
      })

      return this._uploadsMapper.toUploadProfileImageResult(upload)
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw UploadsApplicationError.profileImageUpdateFailed()
      }

      throw error
    }
  }
}