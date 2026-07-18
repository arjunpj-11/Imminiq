import type { Document} from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IUserSettingsDocument extends Document {
  userId: mongoose.Types.ObjectId;
  appearance: { theme: 'light' | 'dark' | 'system' };
  notifications: {
    globalEnabled: boolean;
    types: { adminBroadcasts: boolean };
  };
  privacy: {
    showProfile: boolean;
    showStats: boolean;
    showActivity: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSettingsSchema = new Schema<IUserSettingsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    appearance: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
    },
    notifications: {
      globalEnabled: { type: Boolean, default: true },
      types: {
        adminBroadcasts: { type: Boolean, default: true },
      },
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      showStats: { type: Boolean, default: true },
      showActivity: { type: Boolean, default: true },
    },
  },
  { timestamps: true, collection: 'user_settings' }
);

export const UserSettings =
  mongoose.models.UserSettings ||
  mongoose.model<IUserSettingsDocument>('UserSettings', userSettingsSchema);
