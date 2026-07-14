import mongoose, { Schema } from 'mongoose';

const planLimitUsageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    key: {
      type: String,
      enum: ['tracker_generation', 'lesson_generation', 'mock_test_generation', 'ai_tutor_request'],
      required: true,
    },
    periodStart: { type: Date, required: true },
    count: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true, collection: 'plan_limit_usage' }
);

planLimitUsageSchema.index({ userId: 1, key: 1, periodStart: 1 }, { unique: true });
planLimitUsageSchema.index({ periodStart: 1 }, { expireAfterSeconds: 400 * 86400 });

export const PlanLimitUsage =
  mongoose.models.PlanLimitUsage ||
  mongoose.model('PlanLimitUsage', planLimitUsageSchema);
