import type { Types } from 'mongoose';
export type MongoNotificationRecord = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: string;
  message: string;
  isRead: boolean;
  deepLink?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};
