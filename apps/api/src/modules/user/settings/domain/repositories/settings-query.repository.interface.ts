import type { UserSettingsEntity } from '../entities/user-settings.entity';

export interface ISettingsQueryRepository {
  findByUserId(userId: string): Promise<UserSettingsEntity | null>;

  findOrCreate(userId: string): Promise<UserSettingsEntity>;
}
