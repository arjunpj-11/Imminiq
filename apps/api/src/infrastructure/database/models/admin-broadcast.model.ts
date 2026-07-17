import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const adminBroadcastSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    audience: { type: String, enum: ['all', 'active', 'free', 'pro', 'premium', 'custom'], default: 'all', index: true },
    deepLink: { type: String, trim: true, default: '' },
    poll: {
      question: { type: String, trim: true, maxlength: 180 },
      options: [{ type: String, trim: true, maxlength: 100 }],
    },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['queued', 'processing', 'sent', 'failed'], default: 'queued', index: true },
    sentAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, collection: 'admin_broadcasts' }
);

adminBroadcastSchema.index({ sentAt: -1 });

export type AdminBroadcastDocument = InferSchemaType<typeof adminBroadcastSchema>;
export const AdminBroadcast =
  mongoose.models.AdminBroadcast || mongoose.model('AdminBroadcast', adminBroadcastSchema);
