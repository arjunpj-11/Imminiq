import mongoose, { Schema, model, type InferSchemaType } from 'mongoose';

const chatConversationSchema = new Schema(
  {
    pairKey: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
        message: 'A direct conversation requires two different participants',
      },
    },
    lastMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatMessage',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'chat_conversations',
  }
);

chatConversationSchema.index({ participantIds: 1, deletedAt: 1, lastMessageAt: -1 });

export type ChatConversationDocument = InferSchemaType<typeof chatConversationSchema>;

export const ChatConversation: mongoose.Model<ChatConversationDocument> =
  (mongoose.models.ChatConversation as
    | mongoose.Model<ChatConversationDocument>
    | undefined) ?? model<ChatConversationDocument>('ChatConversation', chatConversationSchema);
