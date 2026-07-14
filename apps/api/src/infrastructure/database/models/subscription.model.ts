import mongoose, { Document, Schema } from 'mongoose';

export type SubscriptionPlanId = 'pro' | 'premium';
export type SubscriptionBillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'pending' | 'active' | 'canceled' | 'expired' | 'replaced' | 'failed';
export type SubscriptionLimits = {
  maxTrackers: number;
  trackerGenerationsPerMonth: number;
  lessonGenerationsPerDay: number;
  mockTestGenerationsPerMonth: number;
  aiTutorRequestsPerDay: number;
};

export interface ISubscriptionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  planId: SubscriptionPlanId;
  planName: string;
  billingCycle: SubscriptionBillingCycle;
  amount: number;
  currency: 'INR';
  status: SubscriptionStatus;
  limits: SubscriptionLimits;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  canceledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: String, enum: ['pro', 'premium'], required: true, index: true },
    planName: { type: String, required: true, trim: true },
    billingCycle: { type: String, enum: ['monthly', 'annual'], required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['INR'], default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'active', 'canceled', 'expired', 'replaced', 'failed'],
      default: 'pending',
      index: true,
    },
    limits: {
      maxTrackers: { type: Number, required: true, min: 0 },
      trackerGenerationsPerMonth: { type: Number, required: true, min: 0 },
      lessonGenerationsPerDay: { type: Number, required: true, min: 0 },
      mockTestGenerationsPerMonth: { type: Number, required: true, min: 0 },
      aiTutorRequestsPerDay: { type: Number, required: true, min: 0 },
    },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, default: null, sparse: true, index: true },
    razorpaySignature: { type: String, default: null },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null, index: true },
    canceledAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'subscriptions' }
);

subscriptionSchema.index({ userId: 1, status: 1, endsAt: -1 });
subscriptionSchema.index({ status: 1, createdAt: -1 });

export const Subscription =
  mongoose.models.Subscription ||
  mongoose.model<ISubscriptionDocument>('Subscription', subscriptionSchema);
