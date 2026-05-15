import mongoose, {
  Schema,
  model,
  type InferSchemaType,
} from 'mongoose'
const userSettingsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    accentColor: {
      type: String,
      default: '#b84c2b',
    },
    fontSize: {
      type: String,
      enum: ['small', 'standard', 'large'],
      default: 'standard',
    },

    gestureControlEnabled: {
      type: Boolean,
      default: false,
    },
    gestureSensitivity: {
      type: Number,
      min: 1,
      max: 100,
      default: 50,
    },

    codeEditorTheme: {
      type: String,
      default: 'imminiq-dark',
    },
    codeEditorLineNumbers: {
      type: Boolean,
      default: true,
    },
    codeEditorAutoComplete: {
      type: Boolean,
      default: true,
    },

    preferredCompilerLanguage: {
      type: String,
      default: 'javascript',
    },
    preferredRuntime: {
      type: String,
      default: 'node',
    },
    autoSwitchCompilerByLesson: {
      type: Boolean,
      default: true,
    },
    compilerAccessibilityMode: {
      type: Boolean,
      default: false,
    },

    aiTone: {
      type: String,
      enum: ['beginner_friendly', 'academic', 'socratic'],
      default: 'beginner_friendly',
    },
    language: {
      type: String,
      default: 'en',
    },
    proactiveAssistanceEnabled: {
      type: Boolean,
      default: true,
    },

    notifAllEnabled: {
      type: Boolean,
      default: true,
    },
    notifEmailEnabled: {
      type: Boolean,
      default: true,
    },
    notifAppEnabled: {
      type: Boolean,
      default: true,
    },
    emailDigest: {
      type: String,
      enum: ['daily', 'weekly', 'never'],
      default: 'weekly',
    },
    quietHoursEnabled: {
      type: Boolean,
      default: false,
    },
    quietHoursFrom: {
      type: String,
      default: '',
    },
    quietHoursTo: {
      type: String,
      default: '',
    },
    quietHoursDays: {
      type: [String],
      default: [],
    },

    privacyMode: {
      type: String,
      enum: ['public', 'balanced', 'private'],
      default: 'balanced',
    },
    privacyShowProfile: {
      type: Boolean,
      default: true,
    },
    privacyShowActivity: {
      type: Boolean,
      default: true,
    },
    privacyShowStats: {
      type: Boolean,
      default: true,
    },
    privacyShowTrackers: {
      type: Boolean,
      default: true,
    },
    privacyAllowClone: {
      type: Boolean,
      default: true,
    },
    privacyShowTrackerProgress: {
      type: Boolean,
      default: false,
    },
    privacyMessagePermission: {
      type: String,
      enum: ['everyone', 'friends_only', 'nobody'],
      default: 'friends_only',
    },
    privacyAllowComments: {
      type: Boolean,
      default: true,
    },
    privacyAllowChallengeInvites: {
      type: Boolean,
      default: true,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'user_settings',
  }
)

export type UserSettingsDocument = InferSchemaType<typeof userSettingsSchema>

export const UserSettings =
  mongoose.models.UserSettings || model('UserSettings', userSettingsSchema)
