import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const contributionSubtopicSchema = new Schema(
  {
    sourceId: { type: String, required: true },
    parentSourceId: { type: String, default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    order: { type: Number, required: true, min: 1 },
    depth: { type: Number, required: true, min: 1 },
    isLocked: { type: Boolean, default: true },
    learningVideo: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const trackerTopicContributionSchema = new Schema(
  {
    sourceTrackerId: { type: Schema.Types.ObjectId, ref: 'Tracker', required: true, index: true },
    cloneTrackerId: { type: Schema.Types.ObjectId, ref: 'Tracker', required: true, index: true },
    cloneTopicId: { type: Schema.Types.ObjectId, ref: 'TrackerTopic', required: true, index: true },
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, default: '', trim: true, maxlength: 2000 },
    subtopics: { type: [contributionSubtopicSchema], default: [] },
    status: {
      type: String,
      enum: ['pending', 'processing', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedAt: { type: Date, default: null },
    mergedTopicId: { type: Schema.Types.ObjectId, ref: 'TrackerTopic', default: null },
    reviewNote: { type: String, default: null, trim: true, maxlength: 500 },
    rejectionReason: { type: String, default: null, trim: true, maxlength: 500 },
  },
  { timestamps: true, collection: 'tracker_topic_contributions' }
);

trackerTopicContributionSchema.index({ ownerId: 1, sourceTrackerId: 1, status: 1, createdAt: -1 });
trackerTopicContributionSchema.index(
  { requesterId: 1, cloneTopicId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'processing'] } } }
);

export type TrackerTopicContributionDocument = InferSchemaType<
  typeof trackerTopicContributionSchema
> & { _id: mongoose.Types.ObjectId };

export const TrackerTopicContribution =
  mongoose.models.TrackerTopicContribution ||
  mongoose.model('TrackerTopicContribution', trackerTopicContributionSchema);
