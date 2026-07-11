import { Readable } from 'node:stream'

import { cloudinary } from '../../../../infrastructure/storage/cloudinary.client'
import { StoredProfileImageEntity } from '../../domain/entities/stored-profile-image.entity'
import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { ProfileImageStorageContract } from '../../domain/services/profile-image-storage.interface'
import type { ProfileImageFolder } from '../../domain/value-objects/profile-image-folder.vo'
import type { UploadedProfileImageFile } from '../../domain/value-objects/uploaded-profile-image-file.vo'

export class CloudinaryProfileImageStorageGateway
  implements ProfileImageStorageContract
{
  async uploadProfileImage(
    file: UploadedProfileImageFile,
    folder: ProfileImageFolder,
  ): Promise<StoredProfileImageEntity> {
    return new Promise((resolve, reject) => {
      try {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            overwrite: false,
          },
          (error, result) => {
            if (error || !result) {
              reject(
                new UploadsDomainError(
                  'IMAGE_UPLOAD_FAILED',
                  'Image upload failed',
                ),
              )
              return
            }

            resolve(
              new StoredProfileImageEntity({
                fileUrl: result.secure_url,
                fileName: file.originalname,
                fileType: file.mimetype.split('/')[1] ?? 'image',
                mimeType: file.mimetype,
                sizeBytes: file.size,
                ...(result.public_id
                  ? { storagePublicId: result.public_id }
                  : {}),
              }),
            )
          },
        )

        Readable.from(file.buffer).pipe(stream)
      } catch {
        reject(
          new UploadsDomainError(
            'IMAGE_UPLOAD_FAILED',
            'Image upload failed',
          ),
        )
      }
    })
  }
}

export const cloudinaryProfileImageStorageGateway =
  new CloudinaryProfileImageStorageGateway()
