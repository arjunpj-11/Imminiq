export type ProfileUploadKind = 'avatar' | 'banner'

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
  file: Express.Multer.File
}
