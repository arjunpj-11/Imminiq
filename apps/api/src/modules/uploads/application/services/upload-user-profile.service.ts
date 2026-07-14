import type { IGetMeUseCase } from '../../../user/users';
import type { IUploadUserProfileContextDTO } from '../uploads.dto';
import { UploadsApplicationError } from '../uploads-application.error';

export interface IUploadUserProfileReader {
  getRequiredContext(userId: string): Promise<IUploadUserProfileContextDTO>;
}

export class UploadUserProfileReader implements IUploadUserProfileReader {
  constructor(private readonly _usersProfileReader: IGetMeUseCase) {}

  async getRequiredContext(userId: string): Promise<IUploadUserProfileContextDTO> {
    try {
      const { user, profile } = await this._usersProfileReader.execute(userId);

      if (!profile._id) {
        throw UploadsApplicationError.userProfileUnavailable();
      }

      return {
        userId: user._id,
        fullName: user.fullName,
        profileId: profile._id,
      };
    } catch (error) {
      if (this.hasErrorCode(error, 'USER_NOT_FOUND')) {
        throw UploadsApplicationError.userNotFound();
      }

      throw error;
    }
  }

  private hasErrorCode(error: unknown, expectedCode: string): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === expectedCode
    );
  }
}
