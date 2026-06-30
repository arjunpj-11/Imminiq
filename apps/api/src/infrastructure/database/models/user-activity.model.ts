import mongoose, {
  Schema,
  model,
  type InferSchemaType,
} from 'mongoose'

export const USER_ACTIVITY_CATEGORIES = [
  'tracker',
  'mock_test',
  'community',
  'streak',
  'xp_milestone',
] as const

export const USER_ACTIVITY_TYPES = [
  'subtopic_completed',
  'topic_completed',
  'tracker_completed',

  'mock_test_generated',
  'mock_test_completed',

  'tracker_cloned',
  'tracker_verified',
  'community_review_completed',

  'streak_milestone',
  'xp_milestone',
  'daily_goal_completed',
] as const

export const USER_ACTIVITY_XP_BUCKETS = [
  'learning',
  'teacher',
  'none',
] as const

const activityDetailsSchema = new Schema(
  {
    scorePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: undefined,
    },

    totalQuestions: {
      type: Number,
      min: 0,
      default: undefined,
    },

    correctAnswers: {
      type: Number,
      min: 0,
      default: undefined,
    },

    durationSeconds: {
      type: Number,
      min: 0,
      default: undefined,
    },

    previousLevel: {
      type: Number,
      min: 1,
      default: undefined,
    },

    currentLevel: {
      type: Number,
      min: 1,
      default: undefined,
    },

    milestoneValue: {
      type: Number,
      min: 0,
      default: undefined,
    },

    previousRank: {
      type: Number,
      min: 1,
      default: undefined,
    },

    currentRank: {
      type: Number,
      min: 1,
      default: undefined,
    },

    difficulty: {
      type: String,
      enum: [
        'beginner',
        'intermediate',
        'advanced',
      ],
      default: undefined,
    },
  },
  {
    _id: false,
  },
)

const userActivitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    category: {
      type: String,
      enum: USER_ACTIVITY_CATEGORIES,
      required: true,
    },

    type: {
      type: String,
      enum: USER_ACTIVITY_TYPES,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },

    subtitle: {
      type: String,
      trim: true,
      default: '',
      maxlength: 300,
    },

    xpAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },

    xpBucket: {
      type: String,
      enum: USER_ACTIVITY_XP_BUCKETS,
      default: 'none',
    },

    coinsAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Prevents duplicated activities and duplicated rewards.
     *
     * Examples:
     * subtopic-completed:<trackerId>:<subtopicId>
     * topic-completed:<trackerId>:<topicId>
     * mock-test-completed:<attemptId>
     */
    eventKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    trackerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tracker',
      default: null,
    },

    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'TrackerTopic',
      default: null,
    },

    subtopicId: {
      type: Schema.Types.ObjectId,
      ref: 'TrackerSubtopic',
      default: null,
    },

    mockTestId: {
      type: Schema.Types.ObjectId,
      ref: 'MockTest',
      default: null,
    },

    attemptId: {
      type: Schema.Types.ObjectId,
      ref: 'MockTestAttempt',
      default: null,
    },

    sourceUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    details: {
      type: activityDetailsSchema,
      default: {},
    },

    occurredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'user_activities',
  },
)

userActivitySchema.index(
  {
    userId: 1,
    eventKey: 1,
  },
  {
    unique: true,
    name: 'user_activity_event_key_unique',
  },
)

userActivitySchema.index(
  {
    userId: 1,
    deletedAt: 1,
    occurredAt: -1,
    _id: -1,
  },
  {
    name: 'user_activity_feed',
  },
)

userActivitySchema.index(
  {
    userId: 1,
    category: 1,
    deletedAt: 1,
    occurredAt: -1,
    _id: -1,
  },
  {
    name: 'user_activity_category_feed',
  },
)

userActivitySchema.index(
  {
    userId: 1,
    type: 1,
    deletedAt: 1,
    occurredAt: -1,
  },
  {
    name: 'user_activity_type_statistics',
  },
)

userActivitySchema.index(
  {
    userId: 1,
    xpBucket: 1,
    deletedAt: 1,
    occurredAt: -1,
  },
  {
    name: 'user_activity_xp_statistics',
  },
)

userActivitySchema.index(
  {
    trackerId: 1,
    topicId: 1,
    subtopicId: 1,
  },
  {
    name: 'user_activity_tracker_sources',
  },
)

userActivitySchema.index(
  {
    mockTestId: 1,
    attemptId: 1,
  },
  {
    name: 'user_activity_mock_test_sources',
  },
)

export type UserActivityDocument =
  InferSchemaType<typeof userActivitySchema>

export const UserActivity =
  mongoose.models.UserActivity ||
  model('UserActivity', userActivitySchema)
