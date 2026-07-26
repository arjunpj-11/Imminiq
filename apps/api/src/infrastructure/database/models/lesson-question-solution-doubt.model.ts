import mongoose, { Schema } from 'mongoose';

const lessonQuestionSolutionDoubtSchema = new Schema(
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

    solutionId: {
      type: Schema.Types.ObjectId,
      ref: 'LessonQuestionSolution',
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

    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
      index: true,
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

lessonQuestionSolutionDoubtSchema.index({
  trackerId: 1,
  subtopicId: 1,
  userId: 1,
  questionHash: 1,
  createdAt: 1,
});

lessonQuestionSolutionDoubtSchema.index({
  solutionId: 1,
  createdAt: 1,
});

export const LessonQuestionSolutionDoubt =
  mongoose.models.LessonQuestionSolutionDoubt ||
  mongoose.model('LessonQuestionSolutionDoubt', lessonQuestionSolutionDoubtSchema);
