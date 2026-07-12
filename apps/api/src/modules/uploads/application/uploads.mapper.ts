import type { UploadedProfileImageEntity } from '../domain/entities/uploaded-profile-image.entity'
import type {
  IUploadProfileImageResultDTO,
} from './uploads.dto'

export interface IUploadsMapper {
  toUploadProfileImageResult(
    upload: UploadedProfileImageEntity,
  ): IUploadProfileImageResultDTO
}

export class UploadsMapper implements IUploadsMapper {
  toUploadProfileImageResult(
    upload: UploadedProfileImageEntity,
  ): IUploadProfileImageResultDTO {
    return {
      uploadId: upload.id,
      fileUrl: upload.fileUrl,
      kind: upload.kind,
    }
  }
}
