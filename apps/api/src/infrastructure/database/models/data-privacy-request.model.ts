import mongoose, { Schema } from 'mongoose';

export type DataPrivacyRequestType = 'access' | 'export' | 'delete' | 'correction';
export type DataPrivacyRequestStatus =
  'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

export interface IDataPrivacyRequestDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: DataPrivacyRequestType;
  details: string;
  status: DataPrivacyRequestStatus;
  assignedTo?: mongoose.Types.ObjectId | null;
  resolutionNote?: string | null;
  downloadUrl?: string | null;
  dueAt: Date;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IDataPrivacyRequestDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['access', 'export', 'delete', 'correction'], required: true },
    details: { type: String, trim: true, maxlength: 3000, default: '' },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolutionNote: { type: String, trim: true, maxlength: 3000, default: null },
    downloadUrl: { type: String, trim: true, maxlength: 2048, default: null },
    dueAt: { type: Date, required: true, index: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

schema.index({ userId: 1, status: 1, createdAt: -1 });
schema.index({ status: 1, dueAt: 1 });

export const DataPrivacyRequest = mongoose.model<IDataPrivacyRequestDocument>(
  'DataPrivacyRequest',
  schema
);
