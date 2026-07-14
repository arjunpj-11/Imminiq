import mongoose, { Schema } from 'mongoose';

const limitsSchema = new Schema(
  {
    maxTrackers: { type: Number, required: true, min: 0 },
    trackerGenerationsPerMonth: { type: Number, required: true, min: 0 },
    lessonGenerationsPerDay: { type: Number, required: true, min: 0 },
    mockTestGenerationsPerMonth: { type: Number, required: true, min: 0 },
    aiTutorRequestsPerDay: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const subscriptionPlanSchema = new Schema(
  {
    code: { type: String, enum: ['free', 'pro', 'premium'], required: true, unique: true },
    planId: { type: String, enum: ['free', 'pro', 'premium'], required: true, unique: true },
    limits: { type: limitsSchema, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, collection: 'subscription_plans' }
);

export const SubscriptionPlan =
  mongoose.models.SubscriptionPlan ||
  mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
