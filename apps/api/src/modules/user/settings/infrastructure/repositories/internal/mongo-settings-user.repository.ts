import { UserSettings } from '../../../../../../infrastructure/database/models/user-settings.model';
import type {
  UpdateSettingsAppearanceInput,
  UpdateSettingsNotificationTypesInput,
  UpdateSettingsNotificationsInput,
  UpdateSettingsPrivacyInput,
} from '../../../domain/repositories/settings-command.repository.interface';
import type { ISettingsRepository } from '../../../domain/repositories/settings.repository.interface';
import { MongoSettingsBaseRepository } from '../shared/mongo-settings-base.repository';
import { MongoSettingsErrorMapper } from '../shared/mongo-settings-error.mapper';
import { MongoSettingsMapper } from '../shared/mongo-settings.mapper';
import type {
  FlatSettingsUpdate,
  MongoUserSettingsRecord,
  MongooseObjectLike,
} from '../shared/mongo-settings.types';

export class MongoSettingsRepository
  extends MongoSettingsBaseRepository
  implements ISettingsRepository
{
  constructor(private readonly _mapper = new MongoSettingsMapper()) {
    super();
  }

  async findByUserId(userId: string) {
    return this.execute('SETTINGS_READ_FAILED', 'Failed to read user settings', async () => {
      const settings = await UserSettings.findOne({
        userId,
      }).lean<MongoUserSettingsRecord>();

      return this._mapper.toEntity(settings);
    });
  }

  async findOrCreate(userId: string) {
    return this.execute(
      'SETTINGS_READ_OR_CREATE_FAILED',
      'Failed to find or create user settings',
      async () => {
        const existingSettings = await UserSettings.findOne({
          userId,
        }).lean<MongoUserSettingsRecord>();

        if (existingSettings) {
          return this._mapper.toEntityOrThrow(existingSettings);
        }

        const createdSettings = await UserSettings.create({
          userId,
        });

        return this._mapper.toEntityOrThrow(
          this._mapper.toPlainRecord<MongoUserSettingsRecord>(
            createdSettings as MongooseObjectLike<MongoUserSettingsRecord>
          )
        );
      },
      MongoSettingsErrorMapper.mapDuplicateSettingsRecordError
    );
  }

  async updateAppearance(input: UpdateSettingsAppearanceInput) {
    return this.updateWithSet(input.userId, this._mapper.toAppearanceUpdate(input.data));
  }

  async updateNotifications(input: UpdateSettingsNotificationsInput) {
    return this.updateWithSet(input.userId, this._mapper.toNotificationsUpdate(input.data));
  }

  async updateNotificationTypes(input: UpdateSettingsNotificationTypesInput) {
    return this.updateWithSet(input.userId, this._mapper.toNotificationTypesUpdate(input.types));
  }

  async updatePrivacy(input: UpdateSettingsPrivacyInput) {
    return this.updateWithSet(input.userId, this._mapper.toPrivacyUpdate(input.data));
  }

  async resetToDefaults(userId: string) {
    return this.execute(
      'SETTINGS_RESET_FAILED',
      'Failed to reset user settings',
      async () => {
        await UserSettings.deleteOne({
          userId,
        });

        const settings = await UserSettings.create({
          userId,
        });

        return this._mapper.toEntityOrThrow(
          this._mapper.toPlainRecord<MongoUserSettingsRecord>(
            settings as MongooseObjectLike<MongoUserSettingsRecord>
          )
        );
      },
      MongoSettingsErrorMapper.mapDuplicateSettingsRecordError
    );
  }

  private async updateWithSet(userId: string, update: FlatSettingsUpdate) {
    return this.execute(
      'SETTINGS_UPDATE_FAILED',
      'Failed to update user settings',
      async () => {
        const settings = await UserSettings.findOneAndUpdate(
          {
            userId,
          },
          {
            $set: update,
            $setOnInsert: {
              userId,
            },
          },
          {
            returnDocument: 'after',
            upsert: true,
            setDefaultsOnInsert: true,
            runValidators: true,
          }
        ).lean<MongoUserSettingsRecord>();

        return this._mapper.toEntity(settings);
      },
      MongoSettingsErrorMapper.mapDuplicateSettingsRecordError
    );
  }
}

export const mongoSettingsRepository = new MongoSettingsRepository();
