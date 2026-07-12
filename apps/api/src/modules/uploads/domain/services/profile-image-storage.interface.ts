import type { StoredProfileImageEntity } from '../entities/stored-profile-image.entity'
import type {
  ProfileImageFolder,
  UploadedProfileImageFile,
} from '../types/uploads.types'

export interface IProfileImageStorage {
  uploadProfileImage(
    file: UploadedProfileImageFile,
    folder: ProfileImageFolder,
  ): Promise<StoredProfileImageEntity>
}
