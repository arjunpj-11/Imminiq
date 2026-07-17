import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  message: string;
  isRead: boolean;
  deepLink?: string;
  metadata?: object;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    deepLink: {
      type: String,
      trim: true,
      default: undefined,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

notificationSchema.index({
  userId: 1,
  isRead: 1,
  createdAt: -1,
});

notificationSchema.index({
  userId: 1,
  createdAt: -1,
});

notificationSchema.index(
  { userId: 1, type: 1, 'metadata.broadcastId': 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: 'admin_broadcast',
      'metadata.broadcastId': { $type: 'string' },
    },
  }
);

export const Notification: mongoose.Model<INotificationDocument> =
  (mongoose.models.Notification as mongoose.Model<INotificationDocument> | undefined) ??
  mongoose.model<INotificationDocument>('Notification', notificationSchema);
