import type { UsersProfileServiceContract } from '../../domain/services/users-profile.service.interface'
import type { UploadUserProfileContext } from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'

export interface UploadUserProfileServiceContract {
  getRequiredContext(userId: string): Promise<UploadUserProfileContext>
}

export class UploadUserProfileService
  implements UploadUserProfileServiceContract
{
  constructor(
    private readonly usersProfileService: UsersProfileServiceContract,
  ) {}

  async getRequiredContext(
    userId: string,
  ): Promise<UploadUserProfileContext> {
    try {
      const { user, profile } = await this.usersProfileService.getMe(userId)

      if (!profile._id) {
        throw UploadsApplicationError.userProfileUnavailable()
      }

      return {
        userId: user._id,
        fullName: user.fullName,
        profileId: profile._id,
      }
    } catch (error) {
      if (this.hasErrorCode(error, 'USER_NOT_FOUND')) {
        throw UploadsApplicationError.userNotFound()
      }

      throw error
    }
  }

  private hasErrorCode(error: unknown, expectedCode: string): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === expectedCode
    )
  }
}
