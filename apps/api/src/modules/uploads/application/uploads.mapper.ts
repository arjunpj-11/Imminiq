import type { UploadedProfileImageEntity } from '../domain/entities/uploaded-profile-image.entity';
import type { UploadProfileImageResultDTO } from './uploads.dto';

export interface IUploadsMapper {
  toUploadProfileImageResult(upload: UploadedProfileImageEntity): UploadProfileImageResultDTO;
}

export class UploadsMapper implements IUploadsMapper {
  toUploadProfileImageResult(upload: UploadedProfileImageEntity): UploadProfileImageResultDTO {
    return {
      uploadId: upload.id,
      fileUrl: upload.fileUrl,
      kind: upload.kind,
    };
  }
}
