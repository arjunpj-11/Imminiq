import { ApiError } from '../../../../shared/utils/ApiError'
import type { UsersProfileGateway } from '../../domain/gateways/users-profile.gateway'
import type { UploadsRepository } from '../../domain/repositories/uploads.repository.interface'
import type { RemoveAvatarResult } from '../../domain/types/uploads.types'

export class RemoveAvatarUseCase {
  constructor(
    private readonly usersProfileGateway: UsersProfileGateway,
    private readonly uploadsRepository: UploadsRepository
  ) {}

  async execute(userId: string): Promise<RemoveAvatarResult> {
    const user = await this.usersProfileGateway.findUserById(userId)

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
