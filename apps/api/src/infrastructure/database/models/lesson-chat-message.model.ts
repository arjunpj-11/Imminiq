// apps/api/src/infrastructure/database/models/lesson-chat-message.model.ts

import mongoose, { Schema } from 'mongoose';

const lessonChatMessageSchema = new Schema(
  {
    trackerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tracker',
      required: true,
      index: true,
    },

    subtopicId: {
      type: Schema.Types.ObjectId,
      ref: 'TrackerSubtopic',
      required: true,
      index: true,
    },

    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'TrackerLesson',
      default: null,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    scope: {
      type: String,
      enum: ['lesson_doubt_chat', 'question_solution_chat'],
      default: 'lesson_doubt_chat',
      index: true,
    },

    questionId: {
      type: String,
      default: null,
      index: true,
    },

    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

lessonChatMessageSchema.index({
  trackerId: 1,
  subtopicId: 1,
  userId: 1,
  scope: 1,
  questionId: 1,
  createdAt: 1,
});

export const LessonChatMessage =
  mongoose.models.LessonChatMessage || mongoose.model('LessonChatMessage', lessonChatMessageSchema);
