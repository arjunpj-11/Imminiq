import type { StoredProfileImageEntity } from '../entities/stored-profile-image.entity';
import type { UploadedProfileImageEntity } from '../entities/uploaded-profile-image.entity';
import type { ProfileUploadKind } from '../uploads.types';

export type SaveUploadRecordInput = {
  userId: string;
  kind: ProfileUploadKind;
  file: StoredProfileImageEntity;
  referenceId: string;
};

export type SoftDeleteLatestProfileUploadInput = {
  userId: string;
  kind: ProfileUploadKind;
};

export interface IUploadRecordRepository {
  saveUploadRecord(input: SaveUploadRecordInput): Promise<UploadedProfileImageEntity>;

  softDeleteLatestProfileUpload(input: SoftDeleteLatestProfileUploadInput): Promise<boolean>;
}
