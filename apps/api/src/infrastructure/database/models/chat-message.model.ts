import mongoose, { Schema, model, type InferSchemaType } from 'mongoose';

const chatAttachmentSchema = new Schema(
  {
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    storagePublicId: { type: String, trim: true, maxlength: 500, default: null },
    name: { type: String, required: true, trim: true, maxlength: 180 },
    mimeType: { type: String, required: true, trim: true, maxlength: 120 },
    sizeBytes: { type: Number, required: true, min: 1 },
    durationSeconds: { type: Number, min: 1, max: 600, default: null },
  },
  { _id: false }
);

const sharedTrackerSchema = new Schema(
  {
    trackerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tracker',
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    visibility: {
      type: String,
      enum: ['private', 'public', 'unlisted'],
      required: true,
    },
  },
  { _id: false }
);

const chatMessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatConversation',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ['text', 'code', 'image', 'file', 'voice', 'tracker'],
      required: true,
      default: 'text',
    },
    text: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: '',
    },
    codeLanguage: {
      type: String,
      trim: true,
      maxlength: 40,
      default: null,
    },
    attachment: {
      type: chatAttachmentSchema,
      default: null,
    },
    sharedTracker: {
      type: sharedTrackerSchema,
      default: null,
    },
    forwardedFromMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatMessage',
      default: null,
    },
    readBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'chat_messages',
  }
);

chatMessageSchema.index({ conversationId: 1, deletedAt: 1, createdAt: -1 });
chatMessageSchema.index({ conversationId: 1, senderId: 1, readBy: 1, deletedAt: 1 });
chatMessageSchema.index({ forwardedFromMessageId: 1, deletedAt: 1 });

export type ChatMessageDocument = InferSchemaType<typeof chatMessageSchema>;

export const ChatMessage: mongoose.Model<ChatMessageDocument> =
  (mongoose.models.ChatMessage as mongoose.Model<ChatMessageDocument> | undefined) ??
  model<ChatMessageDocument>('ChatMessage', chatMessageSchema);
