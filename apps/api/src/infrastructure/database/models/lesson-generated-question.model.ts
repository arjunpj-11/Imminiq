import mongoose, { Schema } from 'mongoose';

const lessonGeneratedQuestionSchema = new Schema(
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

    question: {
      type: String,
      required: true,
      trim: true,
    },

    questionHash: {
      type: String,
      required: true,
      index: true,
    },

    source: {
      type: String,
      enum: ['base', 'ai_generated'],
      default: 'ai_generated',
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
);

lessonGeneratedQuestionSchema.index(
  {
    trackerId: 1,
    subtopicId: 1,
    userId: 1,
    questionHash: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      deletedAt: null,
    },
  }
);

lessonGeneratedQuestionSchema.index({
  trackerId: 1,
  subtopicId: 1,
  userId: 1,
  createdAt: 1,
});

export const LessonGeneratedQuestion =
  mongoose.models.LessonGeneratedQuestion ||
  mongoose.model('LessonGeneratedQuestion', lessonGeneratedQuestionSchema);
