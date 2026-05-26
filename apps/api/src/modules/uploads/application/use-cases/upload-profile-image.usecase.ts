import { ApiError } from '../../../../shared/utils/ApiError'
import type { UploadsRepository } from '../../domain/repositories/uploads.repository.interface'
import type { ProfileImageStorageServiceContract } from '../../domain/services/profile-image-storage.service.interface'
import type { UsersProfileServiceContract } from '../../domain/services/users-profile.service.interface'
import type {
  UploadProfileImageInput,
  UploadProfileImageResult,
} from '../../domain/types/uploads.types'

export class UploadProfileImageUseCase {
  constructor(
    private readonly usersProfileService: UsersProfileServiceContract,
    private readonly profileImageStorageService: ProfileImageStorageServiceContract,
    private readonly uploadsRepository: UploadsRepository
  ) {}

  async execute({
    userId,
    kind,
    file,
  }: UploadProfileImageInput): Promise<UploadProfileImageResult> {
    if (!file) {
      throw new ApiError(400, 'Image file is required')
    }

    const user = await this.usersProfileService.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    const profile = await this.usersProfileService.ensureProfileForUser(
      String(user._id),
      user.fullName ?? ''
    )

    const folder =
      kind === 'avatar' ? 'imminiq/avatars' : 'imminiq/banners'

    const stored =
      await this.profileImageStorageService.uploadProfileImage(
        file,
        folder
      )

    if (kind === 'avatar') {
      await this.uploadsRepository.setAvatarUrl(userId, stored.fileUrl)
    } else {
      await this.uploadsRepository.setBannerUrl(userId, stored.fileUrl)
    }

    const upload = await this.uploadsRepository.saveUploadRecord(
      userId,
      kind,
      stored,
      String(profile._id)
    )

    return {
      uploadId: String(upload._id),
      fileUrl: stored.fileUrl,
      kind,
    }
  }
}
