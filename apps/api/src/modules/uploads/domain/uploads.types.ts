export type ProfileImageFolder = 'imminiq/avatars' | 'imminiq/banners'
export type ProfileUploadKind = 'avatar' | 'banner'
export type UploadModule = 'profile'
export type UploadReferenceType = 'user_profile'

export type UploadedProfileImageFile = {
  originalname: string
  mimetype: string
  size: number
  buffer: Uint8Array
}
