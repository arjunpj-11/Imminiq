export interface ProfileImageRepositoryContract {
  setAvatarUrl(userId: string, avatarUrl: string): Promise<boolean>
  clearAvatarUrl(userId: string): Promise<boolean>
  setBannerUrl(userId: string, bannerUrl: string): Promise<boolean>
  clearBannerUrl(userId: string): Promise<boolean>
}
