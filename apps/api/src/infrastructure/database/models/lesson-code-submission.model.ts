import mongoose, { Schema } from 'mongoose';

const lessonCodeSubmissionSchema = new Schema(
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

    action: {
      type: String,
      enum: ['run', 'submit'],
      required: true,
      index: true,
    },

    language: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    languageId: {
      type: Number,
      default: null,
    },

    sourceCode: {
      type: String,
      required: true,
    },

    stdin: {
      type: String,
      default: '',
    },

    stdout: {
      type: String,
      default: '',
    },

    stderr: {
      type: String,
      default: '',
    },

    compileOutput: {
      type: String,
      default: '',
    },

    message: {
      type: String,
      default: '',
    },

    status: {
      type: Schema.Types.Mixed,
      default: null,
    },

    time: {
      type: String,
      default: null,
    },

    memory: {
      type: Number,
      default: null,
    },

    isCorrect: {
      type: Boolean,
      default: false,
      index: true,
    },

    expectedOutput: {
      type: String,
      default: '',
    },

    actualOutput: {
      type: String,
      default: '',
    },

    feedback: {
      type: String,
      default: '',
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

lessonCodeSubmissionSchema.index({
  trackerId: 1,
  subtopicId: 1,
  userId: 1,
  action: 1,
  createdAt: -1,
});

export const LessonCodeSubmission =
  mongoose.models.LessonCodeSubmission ||
  mongoose.model('LessonCodeSubmission', lessonCodeSubmissionSchema);
