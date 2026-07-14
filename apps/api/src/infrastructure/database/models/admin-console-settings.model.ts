import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { PLATFORM_POLICY_DEFAULTS } from '../../../shared/platform-policy';

const productPolicySchema = new Schema(
  {
    activity: {
      weeklyXpTarget: {
        type: Number,
        min: 1,
        max: 1_000_000,
        default: PLATFORM_POLICY_DEFAULTS.activity.weeklyXpTarget,
      },
      dailyGoalRewardXp: {
        type: Number,
        min: 0,
        max: 100_000,
        default: PLATFORM_POLICY_DEFAULTS.activity.dailyGoalRewardXp,
      },
    },
    community: {
      verificationRequiredVotes: {
        type: Number,
        min: 1,
        max: 50,
        default: PLATFORM_POLICY_DEFAULTS.community.verificationRequiredVotes,
      },
      verificationDurationHours: {
        type: Number,
        min: 1,
        max: 168,
        default: PLATFORM_POLICY_DEFAULTS.community.verificationDurationHours,
      },
      voteTeacherXp: {
        type: Number,
        min: 0,
        max: 100_000,
        default: PLATFORM_POLICY_DEFAULTS.community.voteTeacherXp,
      },
      majorityTeacherXp: {
        type: Number,
        min: 0,
        max: 100_000,
        default: PLATFORM_POLICY_DEFAULTS.community.majorityTeacherXp,
      },
      reviewRewardCoins: {
        type: Number,
        min: 0,
        max: 100_000,
        default: PLATFORM_POLICY_DEFAULTS.community.reviewRewardCoins,
      },
    },
    leaderboard: {
      targetRank: {
        type: Number,
        min: 1,
        max: 10_000,
        default: PLATFORM_POLICY_DEFAULTS.leaderboard.targetRank,
      },
      weeklyTierXp: {
        type: Number,
        min: 1,
        max: 1_000_000,
        default: PLATFORM_POLICY_DEFAULTS.leaderboard.weeklyTierXp,
      },
      studentRewardCoins: {
        type: Number,
        min: 0,
        max: 1_000_000,
        default: PLATFORM_POLICY_DEFAULTS.leaderboard.studentRewardCoins,
      },
      trainerRewardCoins: {
        type: Number,
        min: 0,
        max: 1_000_000,
        default: PLATFORM_POLICY_DEFAULTS.leaderboard.trainerRewardCoins,
      },
      studentBadgeName: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 80,
        default: PLATFORM_POLICY_DEFAULTS.leaderboard.studentBadgeName,
      },
      trainerBadgeName: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 80,
        default: PLATFORM_POLICY_DEFAULTS.leaderboard.trainerBadgeName,
      },
    },
    mockTests: {
      maxManualQuestions: {
        type: Number,
        min: 1,
        max: 500,
        default: PLATFORM_POLICY_DEFAULTS.mockTests.maxManualQuestions,
      },
      defaultTimeLimitMinutes: {
        type: Number,
        min: 1,
        max: 480,
        default: PLATFORM_POLICY_DEFAULTS.mockTests.defaultTimeLimitMinutes,
      },
      defaultPassingScore: {
        type: Number,
        min: 1,
        max: 100,
        default: PLATFORM_POLICY_DEFAULTS.mockTests.defaultPassingScore,
      },
      completionXp: {
        type: Number,
        min: 0,
        max: 100_000,
        default: PLATFORM_POLICY_DEFAULTS.mockTests.completionXp,
      },
    },
    trackers: {
      subtopicCompletionXp: {
        type: Number,
        min: 0,
        max: 100_000,
        default: PLATFORM_POLICY_DEFAULTS.trackers.subtopicCompletionXp,
      },
      topicCompletionXp: {
        type: Number,
        min: 0,
        max: 100_000,
        default: PLATFORM_POLICY_DEFAULTS.trackers.topicCompletionXp,
      },
      trackerCompletionXp: {
        type: Number,
        min: 0,
        max: 100_000,
        default: PLATFORM_POLICY_DEFAULTS.trackers.trackerCompletionXp,
      },
    },
    security: {
      accountDeletionRecoveryDays: {
        type: Number,
        min: 1,
        max: 365,
        default: PLATFORM_POLICY_DEFAULTS.security.accountDeletionRecoveryDays,
      },
    },
  },
  { _id: false }
);

const adminConsoleSettingsSchema = new Schema(
  {
    key: { type: String, default: 'global', unique: true, immutable: true },
    allowBroadcasts: { type: Boolean, default: true },
    supportEmail: { type: String, trim: true, lowercase: true, default: 'support@imminiq.com' },
    auditRetentionDays: { type: Number, min: 30, max: 3650, default: 365 },
    productPolicy: { type: productPolicySchema, default: () => ({}) },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, collection: 'admin_console_settings' }
);

export type AdminConsoleSettingsDocument = InferSchemaType<typeof adminConsoleSettingsSchema>;
export const AdminConsoleSettings =
  mongoose.models.AdminConsoleSettings ||
  mongoose.model('AdminConsoleSettings', adminConsoleSettingsSchema);
