import { Readable } from 'node:stream'

import { ApiError } from '../../../../shared/utils/ApiError'
import { cloudinary } from '../../../../infrastructure/storage/cloudinary.client'
import type { ProfileImageStorageServiceContract } from '../../domain/services/profile-image-storage.service.interface'
import type {
  StoredProfileImage,
  UploadedProfileImageFile,
} from '../../domain/types/uploads.types'

export const cloudinaryProfileImageStorageGateway: ProfileImageStorageServiceContract = {
  async uploadProfileImage(
    file: UploadedProfileImageFile,
    folder: string
  ): Promise<StoredProfileImage> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) {
            reject(new ApiError(500, 'Image upload failed'))
            return
          }

          resolve({
            fileUrl: result.secure_url,
            fileName: file.originalname,
            fileType: file.mimetype.split('/')[1] ?? 'image',
            mimeType: file.mimetype,
            sizeBytes: file.size,
            storagePublicId: result.public_id,
          })
        }
      )

      Readable.from(file.buffer).pipe(stream)
    })
  },
}
