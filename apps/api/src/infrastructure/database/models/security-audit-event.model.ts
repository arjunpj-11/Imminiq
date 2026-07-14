import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

const securityAuditEventSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    eventType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    outcome: {
      type: String,
      enum: ['success', 'failure', 'blocked', 'detected'],
      required: true,
      index: true,
    },

    ipAddress: {
      type: String,
      default: '',
      trim: true,
    },

    userAgent: {
      type: String,
      default: '',
      trim: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'security_audit_events',
  }
);

securityAuditEventSchema.index({
  userId: 1,
  createdAt: -1,
});

securityAuditEventSchema.index({
  eventType: 1,
  createdAt: -1,
});

export type SecurityAuditEventDocument = InferSchemaType<typeof securityAuditEventSchema> & {
  _id: Types.ObjectId;
};

export const SecurityAuditEvent = model('SecurityAuditEvent', securityAuditEventSchema);
