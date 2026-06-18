import type { UserSettingsEntity } from '../entities/user-settings.entity'

export interface SettingsQueryRepositoryContract {
  findByUserId(userId: string): Promise<UserSettingsEntity | null>
  findOrCreate(userId: string): Promise<UserSettingsEntity>
}
