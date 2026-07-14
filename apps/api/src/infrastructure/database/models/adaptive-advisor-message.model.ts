import mongoose, { Schema } from 'mongoose';

const adaptiveAdvisorMessageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: { type: String, required: true, maxlength: 8000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

adaptiveAdvisorMessageSchema.index({ userId: 1, createdAt: -1 });

export const AdaptiveAdvisorMessageModel =
  mongoose.models.AdaptiveAdvisorMessage ||
  mongoose.model('AdaptiveAdvisorMessage', adaptiveAdvisorMessageSchema);
