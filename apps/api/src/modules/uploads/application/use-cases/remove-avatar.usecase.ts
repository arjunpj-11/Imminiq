import { ApiError } from '../../../../shared/utils/ApiError'
import type { UploadsRepository } from '../../domain/repositories/uploads.repository.interface'
import type { UsersProfileServiceContract } from '../../domain/services/users-profile.service.interface'
import type { RemoveAvatarResult } from '../../domain/types/uploads.types'

export class RemoveAvatarUseCase {
  constructor(
    private readonly usersProfileService: UsersProfileServiceContract,
    private readonly uploadsRepository: UploadsRepository
  ) {}

  async execute(userId: string): Promise<RemoveAvatarResult> {
    const user = await this.usersProfileService.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    await Promise.all([
      this.uploadsRepository.clearAvatarUrl(userId),
      this.uploadsRepository.softDeleteLatestProfileUpload(userId, 'avatar'),
    ])

    return {
      avatarRemoved: true,
      defaultAvatarApplied: true,
    }
  }
}
