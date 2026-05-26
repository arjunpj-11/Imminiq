export { default } from './presentation/uploads.routes'
export { default as uploadsRoutes } from './presentation/uploads.routes'
export { uploadsController } from './presentation/uploads.controller'
export { uploadsService } from './uploads.service'

export type {
  ProfileUploadKind,
  StoredProfileImage,
  UploadedProfileImageFile,
  UploadProfileImageInput,
  UploadProfileImageResult,
  RemoveAvatarResult,
  RemoveBannerResult,
  AiImagePreviewResult,
  UserRecordForUpload,
  UserProfileRecordForUpload,
} from './domain/types/uploads.types'
