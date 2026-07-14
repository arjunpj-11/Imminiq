import mongoose, { Schema, model, type InferSchemaType } from 'mongoose';

export const AI_TOKEN_USAGE_CATEGORIES = [
  'roadmap_generation',
  'roadmap_evaluation',
  'mock_test_generation',
  'mock_test_evaluation',
  'lesson_generation',
  'lesson_practice',
  'ai_tutoring',
  'adaptive_learning',
  'tracker_verification',
  'dashboard_insights',
  'other',
] as const;

export type AITokenUsageCategory = (typeof AI_TOKEN_USAGE_CATEGORIES)[number];

const aiTokenUsageSchema = new Schema(
  {
    provider: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      enum: AI_TOKEN_USAGE_CATEGORIES,
      required: true,
      default: 'other',
      index: true,
    },
    promptTokens: { type: Number, required: true, min: 0, default: 0 },
    completionTokens: { type: Number, required: true, min: 0, default: 0 },
    totalTokens: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true, collection: 'ai_token_usage' }
);

aiTokenUsageSchema.index({ createdAt: -1, category: 1 });
aiTokenUsageSchema.index({ createdAt: -1, provider: 1 });

export type AITokenUsageDocument = InferSchemaType<typeof aiTokenUsageSchema>;

export const AITokenUsage =
  mongoose.models.AITokenUsage || model('AITokenUsage', aiTokenUsageSchema);
