import type { ProfileUploadKind, UploadedProfileImageFile } from '../domain/uploads.types';

export interface UploadProfileImageInputDTO {
  userId: string;
  kind: ProfileUploadKind;
  file?: UploadedProfileImageFile;
}

export interface UploadProfileImageResultDTO {
  uploadId: string;
  fileUrl: string;
  kind: ProfileUploadKind;
}

export interface RemoveAvatarResultDTO {
  avatarRemoved: true;
  defaultAvatarApplied: true;
}

export interface RemoveBannerResultDTO {
  bannerRemoved: true;
}

export interface AIImagePreviewResultDTO {
  imageUrl: string;
}

export interface GenerateAIImagePreviewInputDTO {
  prompt: string;
}

export interface UploadUserProfileContextDTO {
  userId: string;
  fullName: string;
  profileId: string;
}
