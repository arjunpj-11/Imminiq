import { UploadsDomainError } from '../../domain/uploads-domain.error';
import type { IProfileImageRepository } from '../../domain/repositories/profile-image.repository.interface';
import type { IUploadRecordRepository } from '../../domain/repositories/upload-record.repository.interface';
import type { IRemoveBannerResultDTO } from '../uploads.dto';
import { UploadsApplicationError } from '../uploads-application.error';
import type { IUploadUserProfileReader } from '../services/upload-user-profile.service';

type RemoveBannerRepository = IProfileImageRepository & IUploadRecordRepository;

export interface IRemoveBannerUseCase {
  execute(userId: string): Promise<IRemoveBannerResultDTO>;
}

export class RemoveBannerUseCase implements IRemoveBannerUseCase {
  constructor(
    private readonly _userProfileReader: IUploadUserProfileReader,
    private readonly _uploadsRepository: RemoveBannerRepository
  ) {}

  async execute(userId: string): Promise<IRemoveBannerResultDTO> {
    const context = await this._userProfileReader.getRequiredContext(userId);

    try {
      await Promise.all([
        this._uploadsRepository.clearBannerUrl(context.userId),
        this._uploadsRepository.softDeleteLatestProfileUpload({
          userId: context.userId,
          kind: 'banner',
        }),
      ]);

      return { bannerRemoved: true };
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw UploadsApplicationError.profileImageUpdateFailed();
      }

      throw error;
    }
  }
}
