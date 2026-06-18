import { UserSettings } from '../../../../infrastructure/database/models/user-settings.model'

import { SETTINGS_NOTIFICATION_TYPE_KEYS } from '../../domain/constants/settings.constants'
import { UserSettingsEntity } from '../../domain/entities/user-settings.entity'
import { SettingsDomainError } from '../../domain/errors/settings-domain.error'
import type {
  SettingsAccountUpdateInput,
  SettingsAIBehaviourUpdateInput,
  SettingsAppearanceUpdateInput,
  SettingsCodeEditorUpdateInput,
  SettingsCommandRepositoryContract,
  SettingsCompilerUpdateInput,
  SettingsEmailDigestUpdateInput,
  SettingsGesturesUpdateInput,
  SettingsLearningJourneyUpdateInput,
  SettingsNotificationsUpdateInput,
  SettingsPrivacyUpdateInput,
  SettingsQuietHoursUpdateInput,
} from '../../domain/repositories/settings-command.repository.interface'
import type { SettingsRepositoryContract } from '../../domain/repositories/settings.repository.interface'
import type {
  NotificationTypeSettings,
  UserSettingsData,
} from '../../domain/value-objects/user-settings-data.vo'

type MongoIdLike = {
  toString(): string
}

type MongoUserSettingsRecord = UserSettingsData & {
  _id?: MongoIdLike | string
  userId?: MongoIdLike | string
}

type MongooseObjectLike<T> = {
  toObject(): T
}

type FlatSettingsUpdate = Record<string, unknown>
type UpdatableValue = boolean | number | string | string[] | undefined

const NOTIFICATION_KEYS = [
  'globalEnabled',
  'globalEmail',
  'globalPush',
  'marketing',
  'weeklyReport',
] as const

const PRIVACY_KEYS = [
  'profileVisibility',
  'showProfile',
  'showStreak',
  'showProgress',
  'showLeaderboardRank',
  'showActivity',
  'showOnlineStatus',
  'showStats',
  'allowFriendRequests',
  'allowChallenges',
  'allowMessages',
  'messagePermission',
  'allowPublicTrackerView',
  'allowTrackerCloning',
  'showTrackerProgress',
] as const

const CODE_EDITOR_KEYS = [
  'theme',
  'fontSize',
  'tabSize',
  'autoIndent',
  'lineNumbers',
  'wordWrap',
  'minimap',
] as const

const COMPILER_KEYS = [
  'defaultLanguage',
  'defaultRuntime',
  'autoSwitchLanguage',
] as const

const AI_BEHAVIOUR_KEYS = [
  'responseStyle',
  'autoGenerateLessons',
  'showAIInsights',
  'dailyQuotaAlert',
] as const

const LEARNING_JOURNEY_KEYS = [
  'dailyGoalMinutes',
  'reminderEnabled',
  'reminderTime',
  'autoPlayNextTopic',
  'showEstimatedTime',
] as const

const GESTURE_KEYS = [
  'enabled',
  'sensitivity',
  'swipeToNext',
  'swipeToPrevious',
  'pinchToZoom',
  'backGesture',
  'zoomGesture',
  'annotateGesture',
  'scrollGesture',
] as const

const QUIET_HOURS_KEYS = [
  'quietHoursEnabled',
  'quietHoursStart',
  'quietHoursEnd',
  'quietHoursDays',
] as const

const EMAIL_DIGEST_KEYS = [
  'enabled',
  'frequency',
  'includeActivity',
  'includeRecommendations',
] as const

const ACCOUNT_KEYS = ['language', 'timezone', 'dateFormat'] as const

export class MongoSettingsRepository implements SettingsRepositoryContract {
  async findByUserId(userId: string): Promise<UserSettingsEntity | null> {
    return this.executePersistence(async () => {
      const settings = await UserSettings.findOne({ userId })
        .lean<MongoUserSettingsRecord>()

      return this.toEntity(settings)
    })
  }

  async findOrCreate(userId: string): Promise<UserSettingsEntity> {
    return this.executePersistence(async () => {
      const existingSettings = await UserSettings.findOne({ userId })
        .lean<MongoUserSettingsRecord>()

      if (existingSettings) {
        return this.toEntityOrThrow(existingSettings)
      }

      const createdSettings = await UserSettings.create({ userId })

      return this.toEntityOrThrow(
        this.toPlainRecord<MongoUserSettingsRecord>(
          createdSettings as MongooseObjectLike<MongoUserSettingsRecord>,
        ),
      )
    })
  }

  async updateAppearance(
    userId: string,
    data: SettingsAppearanceUpdateInput,
  ): Promise<UserSettingsEntity | null> {
    return this.updateSection(userId, 'appearance', data, ['theme'])
  }

  async updateNotifications(
    userId: string,
    data: Omit<SettingsNotificationsUpdateInput, 'types'>,
  ): Promise<UserSettingsEntity | null> {
    return this.updateSection(userId, 'notifications', data, NOTIFICATION_KEYS)
  }

  async updateNotificationTypes(
    userId: string,
    types: Partial<NotificationTypeSettings>,
  ): Promise<UserSettingsEntity | null> {
    const update: FlatSettingsUpdate = {}

    for (const key of SETTINGS_NOTIFICATION_TYPE_KEYS) {
      const value = types[key]

      if (value !== undefined) {
        update[`notifications.types.${key}`] = value
      }
    }

    return this.updateWithSet(userId, update)
  }

  async updatePrivacy(
    userId: string,
    data: SettingsPrivacyUpdateInput,
  ): Promise<UserSettingsEntity | null> {
    return this.updateSection(userId, 'privacy', data, PRIVACY_KEYS)
  }

  async updateCodeEditor(
    userId: string,
    data: SettingsCodeEditorUpdateInput,
  ): Promise<UserSettingsEntity | null> {
    return this.updateSection(userId, 'codeEditor', data, CODE_EDITOR_KEYS)
  }

  async updateCompiler(
    userId: string,
    data: SettingsCompilerUpdateInput,
  ): Promise<UserSettingsEntity | null> {
    return this.updateSection(userId, 'compiler', data, COMPILER_KEYS)
  }

  async updateAIBehaviour(
    userId: string,
    data: SettingsAIBehaviourUpdateInput,
  ): Promise<UserSettingsEntity | null> {
    return this.updateSection(userId, 'aiBehaviour', data, AI_BEHAVIOUR_KEYS)
  }

  async updateLearningJourney(
    userId: string,
    data: SettingsLearningJourneyUpdateInput,
  ): Promise<UserSettingsEntity | null> {
    return this.updateSection(
      userId,
      'learningJourney',
      data,
      LEARNING_JOURNEY_KEYS,
    )
  }

  async updateGestures(
    userId: string,
    data: SettingsGesturesUpdateInput,
  ): Promise<UserSettingsEntity | null> {
    return this.updateSection(userId, 'gestures', data, GESTURE_KEYS)
  }

  async updateQuietHours(
    userId: string,
    data: SettingsQuietHoursUpdateInput,
  ): Promise<UserSettingsEntity | null> {
    return this.updateSection(userId, 'notifications', data, QUIET_HOURS_KEYS)
  }

  async updateEmailDigest(
    userId: string,
    data: SettingsEmailDigestUpdateInput,
  ): Promise<UserSettingsEntity | null> {
    return this.updateSection(
      userId,
      'notifications.emailDigest',
      data,
      EMAIL_DIGEST_KEYS,
    )
  }

  async updateAccountSettings(
    userId: string,
    data: SettingsAccountUpdateInput,
  ): Promise<UserSettingsEntity | null> {
    return this.updateSection(userId, 'account', data, ACCOUNT_KEYS)
  }

  async updateCookieConsent(
    userId: string,
    cookieConsent: boolean,
  ): Promise<UserSettingsEntity | null> {
    return this.updateWithSet(userId, { cookieConsent })
  }

  async acceptTerms(userId: string): Promise<UserSettingsEntity | null> {
    return this.updateWithSet(userId, {
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    })
  }

  async resetToDefaults(userId: string): Promise<UserSettingsEntity> {
    return this.executePersistence(async () => {
      await UserSettings.deleteOne({ userId })

      const settings = await UserSettings.create({ userId })

      return this.toEntityOrThrow(
        this.toPlainRecord<MongoUserSettingsRecord>(
          settings as MongooseObjectLike<MongoUserSettingsRecord>,
        ),
      )
    })
  }

  private async updateSection<TData extends object, TKey extends keyof TData>(
    userId: string,
    section: string,
    data: TData,
    allowedKeys: readonly TKey[],
  ): Promise<UserSettingsEntity | null> {
    return this.updateWithSet(
      userId,
      this.toSectionUpdate(section, data, allowedKeys),
    )
  }

  private async updateWithSet(
    userId: string,
    update: FlatSettingsUpdate,
  ): Promise<UserSettingsEntity | null> {
    return this.executePersistence(async () => {
      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        { $set: update },
        {
          new: true,
          returnDocument: 'after',
          upsert: true,
        },
      ).lean<MongoUserSettingsRecord>()

      return this.toEntity(settings)
    })
  }

  private toSectionUpdate<TData extends object, TKey extends keyof TData>(
    prefix: string,
    data: TData,
    allowedKeys: readonly TKey[],
  ): FlatSettingsUpdate {
    const result: FlatSettingsUpdate = {}

    for (const key of allowedKeys) {
      const value = data[key] as UpdatableValue

      if (value !== undefined) {
        result[`${prefix}.${String(key)}`] = value
      }
    }

    return result
  }

  private toPlainRecord<T>(document: MongooseObjectLike<T>): T {
    return document.toObject()
  }

  private toId(value: MongoIdLike | string | undefined): string | undefined {
    if (!value) return undefined
    return typeof value === 'string' ? value : value.toString()
  }

  private toEntity(
    settings: MongoUserSettingsRecord | null,
  ): UserSettingsEntity | null {
    if (!settings) return null

    const settingsView: UserSettingsData = {
      ...settings,
      ...(settings._id ? { _id: settings._id } : {}),
      ...(settings.userId ? { userId: this.toId(settings.userId) } : {}),
    }

    const id = this.toId(settings._id)
    const userId = this.toId(settings.userId) ?? ''

    return new UserSettingsEntity({
      ...(id ? { id } : {}),
      userId,
      settings: settingsView,
    })
  }

  private toEntityOrThrow(settings: MongoUserSettingsRecord): UserSettingsEntity {
    const entity = this.toEntity(settings)

    if (!entity) {
      throw new SettingsDomainError(
        'SETTINGS_MAPPING_FAILED',
        'Failed to map user settings',
      )
    }

    return entity
  }

  private async executePersistence<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof SettingsDomainError) {
        throw error
      }

      throw new SettingsDomainError(
        'SETTINGS_PERSISTENCE_ERROR',
        'Settings persistence failed',
      )
    }
  }
}

export const mongoSettingsRepository = new MongoSettingsRepository()
