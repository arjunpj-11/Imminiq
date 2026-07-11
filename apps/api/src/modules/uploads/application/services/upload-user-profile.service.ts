import type { UsersProfileReaderContract } from '../../domain/services/users-profile.interface'
import type { UploadUserProfileContext } from '../dtos/uploads.dto'
import { UploadsApplicationError } from '../errors/uploads-application.error'

export interface UploadUserProfileReaderContract {
  getRequiredContext(userId: string): Promise<UploadUserProfileContext>
}

export class UploadUserProfileReader
  implements UploadUserProfileReaderContract
{
  constructor(
    private readonly _usersProfileReader: UsersProfileReaderContract,
  ) {}

  async getRequiredContext(
    userId: string,
  ): Promise<UploadUserProfileContext> {
    try {
      const { user, profile } = await this._usersProfileReader.getMe(userId)

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
