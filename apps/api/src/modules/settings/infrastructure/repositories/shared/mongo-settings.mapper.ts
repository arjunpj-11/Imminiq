import { SETTINGS_NOTIFICATION_TYPE_KEYS } from '../../../domain/constants/settings.constants'
import { UserSettingsEntity } from '../../../domain/entities/user-settings.entity'
import { SettingsDomainError } from '../../../domain/errors/settings-domain.error'
import type {
  SettingsAccountUpdateInput,
  SettingsAIBehaviourUpdateInput,
  SettingsAppearanceUpdateInput,
  SettingsCodeEditorUpdateInput,
  SettingsCompilerUpdateInput,
  SettingsEmailDigestUpdateInput,
  SettingsGesturesUpdateInput,
  SettingsLearningJourneyUpdateInput,
  SettingsNotificationsUpdateInput,
  SettingsPrivacyUpdateInput,
  SettingsQuietHoursUpdateInput,
} from '../../../domain/repositories/settings-command.repository.interface'
import type {
  NotificationTypeSettings,
  UserSettingsData,
} from '../../../domain/value-objects/user-settings-data.vo'
import type {
  FlatSettingsUpdate,
  MongoIdLike,
  MongoUserSettingsRecord,
  MongooseObjectLike,
  UpdatableValue,
} from './mongo-settings.types'

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

export class MongoSettingsMapper {
  toPlainRecord<T>(document: MongooseObjectLike<T>): T {
    return document.toObject()
  }

  toId(value: MongoIdLike | string | undefined): string | undefined {
    if (!value) {
      return undefined
    }

    return typeof value === 'string' ? value : value.toString()
  }

  toEntity(settings: MongoUserSettingsRecord | null): UserSettingsEntity | null {
    if (!settings) {
      return null
    }

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

  toEntityOrThrow(settings: MongoUserSettingsRecord): UserSettingsEntity {
    const entity = this.toEntity(settings)

    if (!entity) {
      throw new SettingsDomainError(
        'SETTINGS_MAPPING_FAILED',
        'Failed to map user settings'
      )
    }

    return entity
  }

  toAppearanceUpdate(
    data: SettingsAppearanceUpdateInput
  ): FlatSettingsUpdate {
    return this.toSectionUpdate('appearance', data, ['theme'])
  }

  toNotificationsUpdate(
    data: Omit<SettingsNotificationsUpdateInput, 'types'>
  ): FlatSettingsUpdate {
    return this.toSectionUpdate('notifications', data, NOTIFICATION_KEYS)
  }

  toNotificationTypesUpdate(
    types: Partial<NotificationTypeSettings>
  ): FlatSettingsUpdate {
    const update: FlatSettingsUpdate = {}

    for (const key of SETTINGS_NOTIFICATION_TYPE_KEYS) {
      const value = types[key]

      if (value !== undefined) {
        update[`notifications.types.${key}`] = value
      }
    }

    return update
  }

  toPrivacyUpdate(data: SettingsPrivacyUpdateInput): FlatSettingsUpdate {
    return this.toSectionUpdate('privacy', data, PRIVACY_KEYS)
  }

  toCodeEditorUpdate(
    data: SettingsCodeEditorUpdateInput
  ): FlatSettingsUpdate {
    return this.toSectionUpdate('codeEditor', data, CODE_EDITOR_KEYS)
  }

  toCompilerUpdate(data: SettingsCompilerUpdateInput): FlatSettingsUpdate {
    return this.toSectionUpdate('compiler', data, COMPILER_KEYS)
  }

  toAIBehaviourUpdate(
    data: SettingsAIBehaviourUpdateInput
  ): FlatSettingsUpdate {
    return this.toSectionUpdate('aiBehaviour', data, AI_BEHAVIOUR_KEYS)
  }

  toLearningJourneyUpdate(
    data: SettingsLearningJourneyUpdateInput
  ): FlatSettingsUpdate {
    return this.toSectionUpdate(
      'learningJourney',
      data,
      LEARNING_JOURNEY_KEYS
    )
  }

  toGesturesUpdate(data: SettingsGesturesUpdateInput): FlatSettingsUpdate {
    return this.toSectionUpdate('gestures', data, GESTURE_KEYS)
  }

  toQuietHoursUpdate(
    data: SettingsQuietHoursUpdateInput
  ): FlatSettingsUpdate {
    return this.toSectionUpdate('notifications', data, QUIET_HOURS_KEYS)
  }

  toEmailDigestUpdate(
    data: SettingsEmailDigestUpdateInput
  ): FlatSettingsUpdate {
    return this.toSectionUpdate(
      'notifications.emailDigest',
      data,
      EMAIL_DIGEST_KEYS
    )
  }

  toAccountSettingsUpdate(
    data: SettingsAccountUpdateInput
  ): FlatSettingsUpdate {
    return this.toSectionUpdate('account', data, ACCOUNT_KEYS)
  }

  private toSectionUpdate<TData extends object, TKey extends keyof TData>(
    prefix: string,
    data: TData,
    allowedKeys: readonly TKey[]
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
}