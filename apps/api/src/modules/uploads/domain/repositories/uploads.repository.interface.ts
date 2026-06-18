import type { ProfileImageRepositoryContract } from './profile-image.repository.interface'
import type { UploadRecordRepositoryContract } from './upload-record.repository.interface'

export interface UploadsRepositoryContract
  extends ProfileImageRepositoryContract,
    UploadRecordRepositoryContract {}
