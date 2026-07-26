import mongoose, { Schema } from 'mongoose';

const lessonQuestionSolutionSchema = new Schema(
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

    solution: {
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

lessonQuestionSolutionSchema.index(
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

lessonQuestionSolutionSchema.index({
  trackerId: 1,
  subtopicId: 1,
  userId: 1,
  updatedAt: -1,
});

export const LessonQuestionSolution =
  mongoose.models.LessonQuestionSolution ||
  mongoose.model('LessonQuestionSolution', lessonQuestionSolutionSchema);
