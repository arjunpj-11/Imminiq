import type { IProfileImageRepository } from './profile-image.repository.interface'
import type { IUploadRecordRepository } from './upload-record.repository.interface'

export interface IUploadsRepository
  extends IProfileImageRepository,
    IUploadRecordRepository {}

export type {
  SetProfileAvatarUrlInput,
  SetProfileBannerUrlInput,
} from './profile-image.repository.interface'

export type {
  SaveUploadRecordInput,
  SoftDeleteLatestProfileUploadInput,
} from './upload-record.repository.interface'