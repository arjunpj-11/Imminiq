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

    contentKey: {
      type: String,
      trim: true,
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

lessonVisualizationSchema.index({ contentKey: 1 }, { unique: true, sparse: true });

export const LessonVisualization =
  mongoose.models.LessonVisualization ||
  mongoose.model('LessonVisualization', lessonVisualizationSchema);
