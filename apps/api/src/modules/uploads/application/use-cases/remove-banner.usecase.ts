import { ApiError } from '../../../../shared/utils/ApiError'
import type { UsersProfileGateway } from '../../domain/gateways/users-profile.gateway'
import type { UploadsRepository } from '../../domain/repositories/uploads.repository.interface'
import type { RemoveBannerResult } from '../../domain/types/uploads.types'

export class RemoveBannerUseCase {
  constructor(
    private readonly usersProfileGateway: UsersProfileGateway,
    private readonly uploadsRepository: UploadsRepository
  ) {}

  async execute(userId: string): Promise<RemoveBannerResult> {
    const user = await this.usersProfileGateway.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    await Promise.all([
      this.uploadsRepository.clearBannerUrl(userId),
      this.uploadsRepository.softDeleteLatestProfileUpload(userId, 'banner'),
    ])

    return {
      bannerRemoved: true,
    }
  }
}
