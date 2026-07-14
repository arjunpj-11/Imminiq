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
    name: { type: String, trim: true, minlength: 1, maxlength: 80, required: true },
    description: { type: String, trim: true, minlength: 1, maxlength: 300, required: true },
    monthlyAmount: { type: Number, min: 0, required: true },
    annualAmount: { type: Number, min: 0, required: true },
    currency: { type: String, enum: ['INR'], default: 'INR' },
    features: [{ type: String, trim: true, minlength: 1, maxlength: 120 }],
    highlighted: { type: Boolean, default: false },
    limits: { type: limitsSchema, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, collection: 'subscription_plans' }
);

export const SubscriptionPlan =
  mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
