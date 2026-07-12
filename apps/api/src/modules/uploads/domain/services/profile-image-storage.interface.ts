import type { StoredProfileImageEntity } from '../entities/stored-profile-image.entity'
import type { ProfileImageFolder } from '../value-objects/profile-image-folder.vo'
import type { UploadedProfileImageFile } from '../value-objects/uploaded-profile-image-file.vo'

export interface IProfileImageStorage {
  uploadProfileImage(
    file: UploadedProfileImageFile,
    folder: ProfileImageFolder,
  ): Promise<StoredProfileImageEntity>
}
