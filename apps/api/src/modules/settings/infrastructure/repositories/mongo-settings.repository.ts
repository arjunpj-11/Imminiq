import { UserSettings } from '../../../../infrastructure/database/models/user-settings.model'

import type { SettingsRepository } from '../../domain/repositories/settings.repository.interface'
import type {
  FlatUpdate,
  UserSettingsView,
} from '../../domain/types/settings.types'

const DEFAULT_SETTINGS = (userId: string) => ({ userId })

const asSettingsView = (
  settings: unknown
): UserSettingsView => {
  return settings as UserSettingsView
}

const asNullableSettingsView = (
  settings: unknown
): UserSettingsView | null => {
  return settings ? (settings as UserSettingsView) : null
}

export const mongoSettingsRepository: SettingsRepository = {
  findByUserId: async (userId: string) => {
    const settings = await UserSettings.findOne({ userId })
    return asNullableSettingsView(settings)
  },

  findOrCreate: async (userId: string) => {
    let settings = await UserSettings.findOne({ userId })

    if (!settings) {
      settings = await UserSettings.create(DEFAULT_SETTINGS(userId))
    }

    return asSettingsView(settings)
  },

  updateAppearance: async (userId: string, data: object) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('appearance', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  updateNotifications: async (userId: string, data: object) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('notifications', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  updateNotificationTypes: async (
    userId: string,
    types: Record<string, boolean>
  ) => {
    const update: FlatUpdate = {}

    for (const [key, value] of Object.entries(types)) {
      update[`notifications.types.${key}`] = value
    }

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: update },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  updatePrivacy: async (userId: string, data: object) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('privacy', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  updateCodeEditor: async (userId: string, data: object) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('codeEditor', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  updateCompiler: async (userId: string, data: object) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('compiler', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  updateAIBehaviour: async (userId: string, data: object) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('aiBehaviour', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  updateLearningJourney: async (userId: string, data: object) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('learningJourney', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  updateGestures: async (userId: string, data: object) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('gestures', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  updateQuietHours: async (userId: string, data: object) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('notifications', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  updateEmailDigest: async (userId: string, data: object) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('notifications.emailDigest', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  updateAccountSettings: async (userId: string, data: object) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('account', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  updateCookieConsent: async (
    userId: string,
    cookieConsent: boolean
  ) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { cookieConsent } },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  acceptTerms: async (userId: string) => {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      {
        $set: {
          termsAccepted: true,
          termsAcceptedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )

    return asNullableSettingsView(settings)
  },

  resetToDefaults: async (userId: string) => {
    await UserSettings.deleteOne({ userId })
    const settings = await UserSettings.create(DEFAULT_SETTINGS(userId))
    return asSettingsView(settings)
  },
}

function flattenObject(
  prefix: string,
  obj: Record<string, unknown> | object
): FlatUpdate {
  const result: FlatUpdate = {}

  for (const [key, value] of Object.entries(obj)) {
    result[`${prefix}.${key}`] = value
  }

  return result
}
