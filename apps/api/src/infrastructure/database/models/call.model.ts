import mongoose, { Schema, model, type InferSchemaType } from 'mongoose';

const callSchema = new Schema(
  {
    callerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    calleeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    participantIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
      validate: {
        validator(value: mongoose.Types.ObjectId[]) {
          return value.length === 2 && value[0]?.toString() !== value[1]?.toString();
        },
        message: 'A call requires two different participants',
      },
    },
    type: {
      type: String,
      enum: ['audio', 'video'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 240,
    },
    status: {
      type: String,
      enum: ['ringing', 'accepted', 'declined', 'ended', 'missed', 'cancelled'],
      required: true,
      default: 'ringing',
      index: true,
    },
    acceptedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, min: 0, default: 0 },
    expiresAt: { type: Date, required: true, index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
    collection: 'calls',
  }
);

callSchema.index({ participantIds: 1, createdAt: -1 });
callSchema.index(
  { participantIds: 1 },
  {
    unique: true,
    name: 'one_active_call_per_participant',
    partialFilterExpression: {
      status: { $in: ['ringing', 'accepted'] },
      deletedAt: null,
    },
  }
);

export type CallDocument = InferSchemaType<typeof callSchema>;

export const Call: mongoose.Model<CallDocument> =
  (mongoose.models.Call as mongoose.Model<CallDocument> | undefined) ??
  model<CallDocument>('Call', callSchema);
