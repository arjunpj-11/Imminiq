import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const adminConsoleSettingsSchema = new Schema(
  {
    key: { type: String, default: 'global', unique: true, immutable: true },
    maintenanceMode: { type: Boolean, default: false },
    allowBroadcasts: { type: Boolean, default: true },
    supportEmail: { type: String, trim: true, lowercase: true, default: 'support@imminiq.com' },
    auditRetentionDays: { type: Number, min: 30, max: 3650, default: 365 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, collection: 'admin_console_settings' }
);

export type AdminConsoleSettingsDocument = InferSchemaType<typeof adminConsoleSettingsSchema>;
export const AdminConsoleSettings =
  mongoose.models.AdminConsoleSettings ||
  mongoose.model('AdminConsoleSettings', adminConsoleSettingsSchema);
