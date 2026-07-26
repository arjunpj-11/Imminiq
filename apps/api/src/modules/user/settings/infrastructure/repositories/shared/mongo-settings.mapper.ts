import { SETTINGS_NOTIFICATION_TYPE_KEYS } from '../../../domain/settings.constants';
import { UserSettingsEntity } from '../../../domain/entities/user-settings.entity';
import { SettingsDomainError } from '../../../domain/settings-domain.error';
import type {
  SettingsAppearanceUpdateInput,
  SettingsNotificationsUpdateInput,
  SettingsPrivacyUpdateInput,
} from '../../../domain/repositories/settings-command.repository.interface';
import type { NotificationTypeSettings, UserSettingsData } from '../../../domain/settings.types';
import type {
  FlatSettingsUpdate,
  MongoIdLike,
  MongoUserSettingsRecord,
  MongooseObjectLike,
  UpdatableValue,
} from './mongo-settings.types';

const PRIVACY_KEYS = ['showProfile', 'showStats', 'showActivity', 'showOnlineStatus'] as const;

export class MongoSettingsMapper {
  toPlainRecord<T>(document: MongooseObjectLike<T>): T {
    return document.toObject();
  }
  toId(value: MongoIdLike | string | undefined): string | undefined {
    return value ? (typeof value === 'string' ? value : value.toString()) : undefined;
  }
  toEntity(settings: MongoUserSettingsRecord | null): UserSettingsEntity | null {
    if (!settings) return null;
    const settingsView: UserSettingsData = {
      ...settings,
      ...(settings._id ? { _id: settings._id } : {}),
      ...(settings.userId ? { userId: this.toId(settings.userId) } : {}),
      privacy: {
        ...settings.privacy,
        showOnlineStatus: settings.privacy?.showOnlineStatus ?? true,
      },
    };
    const id = this.toId(settings._id);
    return new UserSettingsEntity({
      ...(id ? { id } : {}),
      userId: this.toId(settings.userId) ?? '',
      settings: settingsView,
    });
  }
  toEntityOrThrow(settings: MongoUserSettingsRecord): UserSettingsEntity {
    const entity = this.toEntity(settings);
    if (!entity)
      throw new SettingsDomainError('SETTINGS_MAPPING_FAILED', 'Failed to map user settings');
    return entity;
  }
  toAppearanceUpdate(data: SettingsAppearanceUpdateInput): FlatSettingsUpdate {
    return this.toSectionUpdate('appearance', data, ['theme']);
  }
  toNotificationsUpdate(data: SettingsNotificationsUpdateInput): FlatSettingsUpdate {
    return this.toSectionUpdate('notifications', data, ['globalEnabled']);
  }
  toNotificationTypesUpdate(types: Partial<NotificationTypeSettings>): FlatSettingsUpdate {
    const update: FlatSettingsUpdate = {};
    for (const key of SETTINGS_NOTIFICATION_TYPE_KEYS) {
      if (types[key] !== undefined) update[`notifications.types.${key}`] = types[key];
    }
    return update;
  }
  toPrivacyUpdate(data: SettingsPrivacyUpdateInput): FlatSettingsUpdate {
    return this.toSectionUpdate('privacy', data, PRIVACY_KEYS);
  }
  private toSectionUpdate<TData extends object, TKey extends keyof TData>(
    prefix: string,
    data: TData,
    keys: readonly TKey[]
  ) {
    const result: FlatSettingsUpdate = {};
    for (const key of keys) {
      const value = data[key] as UpdatableValue;
      if (value !== undefined) result[`${prefix}.${String(key)}`] = value;
    }
    return result;
  }
}
