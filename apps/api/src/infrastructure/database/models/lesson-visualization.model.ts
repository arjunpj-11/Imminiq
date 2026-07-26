import mongoose, { Schema } from 'mongoose';

const lessonVisualizationSchema = new Schema(
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

    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'TrackerLesson',
      default: null,
    },

    html: {
      type: String,
      required: true,
    },

    visualTitle: {
      type: String,
      required: true,
      trim: true,
    },

    visualDescription: {
      type: String,
      default: '',
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

// One visualization per user per subtopic
lessonVisualizationSchema.index({ trackerId: 1, subtopicId: 1, userId: 1 }, { unique: true });

export const LessonVisualization =
  mongoose.models.LessonVisualization ||
  mongoose.model('LessonVisualization', lessonVisualizationSchema);
