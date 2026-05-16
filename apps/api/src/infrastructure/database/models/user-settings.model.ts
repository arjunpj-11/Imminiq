// apps/api/src/infrastructure/database/models/user-settings.model.ts

import mongoose, { Document, Schema } from 'mongoose'

export type QuietHoursDay =
  | 'Mon'
  | 'Tue'
  | 'Wed'
  | 'Thu'
  | 'Fri'
  | 'Sat'
  | 'Sun'

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId

  // Account
  account: {
    email: string
    phone: string
    language: string
    timezone: string
    dateFormat: string
  }

  // Appearance
  appearance: {
    theme: 'light' | 'dark' | 'system'
    accentColor: string
    fontSize: 'small' | 'medium' | 'large'
    layoutDensity: 'comfortable' | 'compact'
  }

  // Notifications
  notifications: {
    globalEnabled: boolean
    globalEmail: boolean
    globalPush: boolean

    marketing: boolean
    weeklyReport: boolean

    quietHoursEnabled: boolean
    quietHoursStart: string
    quietHoursEnd: string
    quietHoursDays: QuietHoursDay[]

    types: {
      friendRequests: boolean
      challenges: boolean
      battleResults: boolean
      testCompletion: boolean
      postLiked: boolean
      postCommented: boolean
      trackerCloned: boolean
      streakMilestones: boolean
      studyReminders: boolean
      adminBroadcasts: boolean
      accountAlerts: boolean
      subscriptionWarnings: boolean
      paymentConfirmations: boolean
      contributionUpdates: boolean
      callMissed: boolean
    }

    emailDigest: {
      enabled: boolean
      frequency: 'daily' | 'weekly' | 'never'
      includeActivity: boolean
      includeRecommendations: boolean
    }
  }

  // Privacy
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'

    showProfile: boolean
    showStreak: boolean
    showProgress: boolean
    showLeaderboardRank: boolean
    showActivity: boolean
    showOnlineStatus: boolean
    showStats: boolean

    allowFriendRequests: boolean
    allowChallenges: boolean
    allowMessages: boolean
    messagePermission: 'everyone' | 'friends' | 'nobody'

    allowPublicTrackerView: boolean
    allowTrackerCloning: boolean
    showTrackerProgress: boolean
  }

  // Code Editor
  codeEditor: {
    theme: string
    fontSize: number
    tabSize: number
    autoIndent: boolean
    lineNumbers: boolean
    wordWrap: boolean
    minimap: boolean
  }

  // Compiler
  compiler: {
    defaultLanguage: string
    defaultRuntime: string
    autoSwitchLanguage: boolean
  }

  // AI Behaviour
  aiBehaviour: {
    responseStyle: 'concise' | 'detailed' | 'eli5'
    autoGenerateLessons: boolean
    showAIInsights: boolean
    dailyQuotaAlert: boolean
  }

  // Learning Journey
  learningJourney: {
    dailyGoalMinutes: number
    reminderEnabled: boolean
    reminderTime: string
    autoPlayNextTopic: boolean
    showEstimatedTime: boolean

  }

  // Gestures
  gestures: {
    enabled: boolean
    sensitivity: number
    swipeToNext: boolean
    swipeToPrevious: boolean
    pinchToZoom: boolean
    backGesture: boolean
    zoomGesture: boolean
    annotateGesture: boolean
    scrollGesture: boolean
  }

  // Legal
  cookieConsent: boolean
  termsAccepted: boolean
  termsAcceptedAt?: Date

  createdAt: Date
  updatedAt: Date
}

const notificationDays = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
] as const

const userSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    account: {
      email: {
        type: String,
        default: '',
      },

      phone: {
        type: String,
        default: '',
      },

      language: {
        type: String,
        default: 'en',
      },

      timezone: {
        type: String,
        default: 'UTC',
      },

      dateFormat: {
        type: String,
        default: 'DD/MM/YYYY',
      },
    },

    appearance: {
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
        enum: ['small', 'medium', 'large'],
        default: 'medium',
      },

      layoutDensity: {
        type: String,
        enum: ['comfortable', 'compact'],
        default: 'comfortable',
      },
    },

    notifications: {
      globalEnabled: {
        type: Boolean,
        default: true,
      },

      globalEmail: {
        type: Boolean,
        default: true,
      },

      globalPush: {
        type: Boolean,
        default: true,
      },

      marketing: {
        type: Boolean,
        default: false,
      },

      weeklyReport: {
        type: Boolean,
        default: true,
      },

      quietHoursEnabled: {
        type: Boolean,
        default: false,
      },

      quietHoursStart: {
        type: String,
        default: '22:00',
      },

      quietHoursEnd: {
        type: String,
        default: '08:00',
      },

      quietHoursDays: {
        type: [
          {
            type: String,
            enum: notificationDays,
          },
        ],
        default: [],
      },

      types: {
        friendRequests: {
          type: Boolean,
          default: true,
        },

        challenges: {
          type: Boolean,
          default: true,
        },

        battleResults: {
          type: Boolean,
          default: true,
        },

        testCompletion: {
          type: Boolean,
          default: true,
        },

        postLiked: {
          type: Boolean,
          default: true,
        },

        postCommented: {
          type: Boolean,
          default: true,
        },

        trackerCloned: {
          type: Boolean,
          default: true,
        },

        streakMilestones: {
          type: Boolean,
          default: true,
        },

        studyReminders: {
          type: Boolean,
          default: true,
        },

        adminBroadcasts: {
          type: Boolean,
          default: true,
        },

        accountAlerts: {
          type: Boolean,
          default: true,
        },

        subscriptionWarnings: {
          type: Boolean,
          default: true,
        },

        paymentConfirmations: {
          type: Boolean,
          default: true,
        },

        contributionUpdates: {
          type: Boolean,
          default: true,
        },

        callMissed: {
          type: Boolean,
          default: true,
        },
      },

      emailDigest: {
        enabled: {
          type: Boolean,
          default: true,
        },

        frequency: {
          type: String,
          enum: ['daily', 'weekly', 'never'],
          default: 'weekly',
        },

        includeActivity: {
          type: Boolean,
          default: true,
        },

        includeRecommendations: {
          type: Boolean,
          default: true,
        },
      },
    },

    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public',
      },

      showProfile: {
        type: Boolean,
        default: true,
      },

      showStreak: {
        type: Boolean,
        default: true,
      },

      showProgress: {
        type: Boolean,
        default: true,
      },

      showLeaderboardRank: {
        type: Boolean,
        default: true,
      },

      showActivity: {
        type: Boolean,
        default: true,
      },

      showOnlineStatus: {
        type: Boolean,
        default: true,
      },

      showStats: {
        type: Boolean,
        default: true,
      },

      allowFriendRequests: {
        type: Boolean,
        default: true,
      },

      allowChallenges: {
        type: Boolean,
        default: true,
      },

      allowMessages: {
        type: Boolean,
        default: true,
      },

      messagePermission: {
        type: String,
        enum: ['everyone', 'friends', 'nobody'],
        default: 'friends',
      },

      allowPublicTrackerView: {
        type: Boolean,
        default: true,
      },

      allowTrackerCloning: {
        type: Boolean,
        default: true,
      },

      showTrackerProgress: {
        type: Boolean,
        default: false,
      },
    },

    codeEditor: {
      theme: {
        type: String,
        default: 'vs-dark',
      },

      fontSize: {
        type: Number,
        default: 14,
      },

      tabSize: {
        type: Number,
        default: 2,
      },

      autoIndent: {
        type: Boolean,
        default: true,
      },

      lineNumbers: {
        type: Boolean,
        default: true,
      },

      wordWrap: {
        type: Boolean,
        default: false,
      },

      minimap: {
        type: Boolean,
        default: false,
      },
    },

    compiler: {
      defaultLanguage: {
        type: String,
        default: 'javascript',
      },

      defaultRuntime: {
        type: String,
        default: 'node18',
      },

      autoSwitchLanguage: {
        type: Boolean,
        default: true,
      },
    },

    aiBehaviour: {
      responseStyle: {
        type: String,
        enum: ['concise', 'detailed', 'eli5'],
        default: 'detailed',
      },

      autoGenerateLessons: {
        type: Boolean,
        default: true,
      },

      showAIInsights: {
        type: Boolean,
        default: true,
      },

      dailyQuotaAlert: {
        type: Boolean,
        default: true,
      },
    },

    learningJourney: {
      dailyGoalMinutes: {
        type: Number,
        default: 60,
      },

      reminderEnabled: {
        type: Boolean,
        default: false,
      },

      reminderTime: {
        type: String,
        default: '09:00',
      },

      autoPlayNextTopic: {
        type: Boolean,
        default: false,
      },

      showEstimatedTime: {
        type: Boolean,
        default: true,
      },
    },

    gestures: {
      enabled: {
        type: Boolean,
        default: true,
      },

      sensitivity: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },

      swipeToNext: {
        type: Boolean,
        default: true,
      },

      swipeToPrevious: {
        type: Boolean,
        default: true,
      },

      pinchToZoom: {
        type: Boolean,
        default: true,
      },

      backGesture: {
        type: Boolean,
        default: true,
      },

      zoomGesture: {
        type: Boolean,
        default: true,
      },

      annotateGesture: {
        type: Boolean,
        default: false,
      },

      scrollGesture: {
        type: Boolean,
        default: true,
      },
    },

    cookieConsent: {
      type: Boolean,
      default: false,
    },

    termsAccepted: {
      type: Boolean,
      default: false,
    },

    termsAcceptedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    collection: 'user_settings',
  }
)

// Keep indexes here only.
userSettingsSchema.index({ userId: 1 })

export const UserSettings =
  mongoose.models.UserSettings ||
  mongoose.model<IUserSettings>('UserSettings', userSettingsSchema)