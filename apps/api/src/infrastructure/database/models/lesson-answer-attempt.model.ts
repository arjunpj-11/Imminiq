// apps/api/src/infrastructure/database/models/lesson-answer-attempt.model.ts

import mongoose, { Schema } from 'mongoose'

const lessonAnswerAttemptSchema = new Schema(
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

    questionId: {
      type: String,
      default: null,
      index: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    feedback: {
      type: Schema.Types.Mixed,
      default: null,
    },

    isCorrect: {
      type: Boolean,
      default: false,
      index: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    attemptNumber: {
      type: Number,
      required: true,
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
  }
)

lessonAnswerAttemptSchema.index({
  trackerId: 1,
  subtopicId: 1,
  userId: 1,
  questionId: 1,
  createdAt: -1,
})

export const LessonAnswerAttempt =
  mongoose.models.LessonAnswerAttempt ||
  mongoose.model('LessonAnswerAttempt', lessonAnswerAttemptSchema)