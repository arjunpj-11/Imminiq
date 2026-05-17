import type { StoredProfileImage } from '../types/uploads.types'

export interface ProfileImageStorageGateway {
  uploadProfileImage(
    file: Express.Multer.File,
    folder: string
  ): Promise<StoredProfileImage>
}
