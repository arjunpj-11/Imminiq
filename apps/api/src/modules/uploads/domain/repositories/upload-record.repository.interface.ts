import type { StoredProfileImageEntity } from '../entities/stored-profile-image.entity'
import type { UploadedProfileImageEntity } from '../entities/uploaded-profile-image.entity'
import type { ProfileUploadKind } from '../value-objects/profile-upload-kind.vo'

export type SaveUploadRecordInput = {
  userId: string
  kind: ProfileUploadKind
  file: StoredProfileImageEntity
  referenceId: string
}

export type SoftDeleteLatestProfileUploadInput = {
  userId: string
  kind: ProfileUploadKind
}

export interface UploadRecordRepositoryContract {
  saveUploadRecord(
    input: SaveUploadRecordInput
  ): Promise<UploadedProfileImageEntity>

  softDeleteLatestProfileUpload(
    input: SoftDeleteLatestProfileUploadInput
  ): Promise<boolean>
}