import { UserSettings } from '../../infrastructure/database/models/user-settings.model'

type FlatUpdate = Record<string, unknown>

const DEFAULT_SETTINGS = (userId: string) => ({ userId })

export const settingsRepository = {
  findByUserId: (userId: string) =>
    UserSettings.findOne({ userId }),

  findOrCreate: async (userId: string) => {
    let settings = await UserSettings.findOne({ userId })

    if (!settings) {
      settings = await UserSettings.create(DEFAULT_SETTINGS(userId))
    }

    return settings
  },

  updateAppearance: (userId: string, data: object) =>
    UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('appearance', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    ),

  updateNotifications: (userId: string, data: object) =>
    UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('notifications', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    ),

  updateNotificationTypes: (
    userId: string,
    types: Record<string, boolean>
  ) => {
    const update: FlatUpdate = {}

    for (const [key, value] of Object.entries(types)) {
      update[`notifications.types.${key}`] = value
    }

    return UserSettings.findOneAndUpdate(
      { userId },
      { $set: update },
      {
        returnDocument: 'after',
        upsert: true,
      }
    )
  },

  updatePrivacy: (userId: string, data: object) =>
    UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('privacy', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    ),

  updateCodeEditor: (userId: string, data: object) =>
    UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('codeEditor', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    ),

  updateCompiler: (userId: string, data: object) =>
    UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('compiler', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    ),

  updateAIBehaviour: (userId: string, data: object) =>
    UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('aiBehaviour', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    ),

  updateLearningJourney: (userId: string, data: object) =>
    UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('learningJourney', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    ),

  updateGestures: (userId: string, data: object) =>
    UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('gestures', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    ),

  updateQuietHours: (userId: string, data: object) =>
    UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('notifications', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    ),

  updateEmailDigest: (userId: string, data: object) =>
    UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('notifications.emailDigest', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    ),

  updateAccountSettings: (userId: string, data: object) =>
    UserSettings.findOneAndUpdate(
      { userId },
      { $set: flattenObject('account', data) },
      {
        returnDocument: 'after',
        upsert: true,
      }
    ),

  updateCookieConsent: (userId: string, cookieConsent: boolean) =>
    UserSettings.findOneAndUpdate(
      { userId },
      { $set: { cookieConsent } },
      {
        returnDocument: 'after',
        upsert: true,
      }
    ),

  acceptTerms: (userId: string) =>
    UserSettings.findOneAndUpdate(
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
    ),

  resetToDefaults: async (userId: string) => {
    await UserSettings.deleteOne({ userId })
    return UserSettings.create(DEFAULT_SETTINGS(userId))
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