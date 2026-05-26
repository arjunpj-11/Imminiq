export type ProfileUploadKind = 'avatar' | 'banner'

export interface UploadedProfileImageFile {
  originalname: string
  mimetype: string
  size: number
  buffer: Buffer
}

export interface StoredProfileImage {
  fileUrl: string
  fileName: string
  fileType: string
  mimeType: string
  sizeBytes: number
  storagePublicId?: string
}

export interface UploadProfileImageInput {
  userId: string
  kind: ProfileUploadKind
  file: UploadedProfileImageFile
}

export interface UploadProfileImageResult {
  uploadId: string
  fileUrl: string
  kind: ProfileUploadKind
}

export interface RemoveAvatarResult {
  avatarRemoved: true
  defaultAvatarApplied: true
}

export interface RemoveBannerResult {
  bannerRemoved: true
}

export interface AiImagePreviewResult {
  imageUrl: string
}

export interface UserRecordForUpload {
  _id: unknown
  fullName?: string | null
}

export interface UserProfileRecordForUpload {
  _id: unknown
}
