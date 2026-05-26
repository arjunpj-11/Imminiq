import type {
  StoredProfileImage,
  UploadedProfileImageFile,
} from '../types/uploads.types'

export interface ProfileImageStorageServiceContract {
  uploadProfileImage(
    file: UploadedProfileImageFile,
    folder: string
  ): Promise<StoredProfileImage>
}
