import mongoose, { Schema } from 'mongoose';

const trackerLessonSchema = new Schema(
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

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    summary: {
      type: String,
      required: true,
      trim: true,
    },

    explanation: {
      type: String,
      required: true,
      trim: true,
    },

    insight: {
      type: String,
      required: true,
      trim: true,
    },

    lessonType: {
      type: String,
      enum: ['concept', 'coding', 'interview', 'system_design', 'theory'],
      default: 'concept',
      index: true,
    },

    compilerRuntime: {
      type: String,
      enum: ['javascript', 'typescript', 'python', 'c++', 'c', 'java', null],
      default: null,
      index: true,
    },

    codeExample: {
      language: {
        type: String,
        default: 'javascript',
      },

      fileName: {
        type: String,
        default: 'lesson.js',
      },

      code: {
        type: String,
        default: '',
      },
    },

    practiceTask: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      starterCode: { type: String, default: '' },
      expectedOutput: { type: String, default: '' },
      expectedAnswer: { type: String, default: '' },
    },

    tags: {
      type: [String],
      default: [],
    },

    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

    estimatedMinutes: {
      type: Number,
      default: 15,
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

trackerLessonSchema.index(
  {
    trackerId: 1,
    subtopicId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

export const TrackerLesson =
  mongoose.models.TrackerLesson || mongoose.model('TrackerLesson', trackerLessonSchema);
