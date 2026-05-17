// apps/api/src/infrastructure/database/models/notification.model.ts

import mongoose, {
  Document,
  Schema,
} from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: string
  message: string
  isRead: boolean
  deepLink?: string
  metadata?: object
  createdAt: Date
}

const notificationSchema =
  new Schema<INotification>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      type: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      isRead: {
        type: Boolean,
        default: false,
      },

      deepLink: {
        type: String,
      },

      metadata: {
        type: Schema.Types.Mixed,
      },
    },
    {
      timestamps: true,
    }
  )

notificationSchema.index({
  userId: 1,
  isRead: 1,
  createdAt: -1,
})

notificationSchema.index({
  userId: 1,
  createdAt: -1,
})

export const Notification =
  mongoose.model<INotification>(
    'Notification',
    notificationSchema
  )