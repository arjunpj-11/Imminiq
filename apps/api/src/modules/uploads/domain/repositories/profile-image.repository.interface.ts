export type SetProfileAvatarUrlInput = {
  userId: string;
  avatarUrl: string;
};

export type SetProfileBannerUrlInput = {
  userId: string;
  bannerUrl: string;
};

export interface IProfileImageRepository {
  setAvatarUrl(input: SetProfileAvatarUrlInput): Promise<boolean>;

  clearAvatarUrl(userId: string): Promise<boolean>;

  setBannerUrl(input: SetProfileBannerUrlInput): Promise<boolean>;

  clearBannerUrl(userId: string): Promise<boolean>;
}
