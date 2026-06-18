import type { StoredProfileImageEntity } from '../entities/stored-profile-image.entity'
import type { UploadedProfileImageEntity } from '../entities/uploaded-profile-image.entity'
import type { ProfileUploadKind } from '../value-objects/profile-upload-kind.vo'

export interface UploadRecordRepositoryContract {
  saveUploadRecord(
    userId: string,
    kind: ProfileUploadKind,
    file: StoredProfileImageEntity,
    referenceId: string,
  ): Promise<UploadedProfileImageEntity>

  softDeleteLatestProfileUpload(
    userId: string,
    kind: ProfileUploadKind,
  ): Promise<boolean>
}
