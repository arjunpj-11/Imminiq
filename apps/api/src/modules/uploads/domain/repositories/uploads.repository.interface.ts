import type {
  ProfileUploadKind,
  StoredProfileImage,
} from '../types/uploads.types'

export interface UploadRecordLike {
  _id: unknown
}

export interface UploadsRepository {
  saveUploadRecord(
    userId: string,
    kind: ProfileUploadKind,
    file: StoredProfileImage,
    referenceId: string
  ): Promise<UploadRecordLike>

  setAvatarUrl(
    userId: string,
    avatarUrl: string
  ): Promise<unknown>

  clearAvatarUrl(
    userId: string
  ): Promise<unknown>

  setBannerUrl(
    userId: string,
    bannerUrl: string
  ): Promise<unknown>

  clearBannerUrl(
    userId: string
  ): Promise<unknown>

  findProfileByUserId(
    userId: string
  ): Promise<unknown>

  softDeleteLatestProfileUpload(
    userId: string,
    kind: ProfileUploadKind
  ): Promise<unknown>
}
