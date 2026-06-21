import type { ProfileImageRepositoryContract } from './profile-image.repository.interface'
import type { UploadRecordRepositoryContract } from './upload-record.repository.interface'

export interface UploadsRepositoryContract
  extends ProfileImageRepositoryContract,
    UploadRecordRepositoryContract {}

export type {
  SetProfileAvatarUrlInput,
  SetProfileBannerUrlInput,
} from './profile-image.repository.interface'

export type {
  SaveUploadRecordInput,
  SoftDeleteLatestProfileUploadInput,
} from './upload-record.repository.interface'