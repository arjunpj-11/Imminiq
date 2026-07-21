import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const challengeQuestionSchema = new Schema(
  {
    prompt: { type: String, required: true, trim: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true, select: false },
    topicTitle: { type: String, required: true, trim: true },
    points: { type: Number, required: true, default: 1, min: 1 },
    isCheckpoint: { type: Boolean, required: true, default: false },
  },
  { _id: true }
);

const challengeAnswerHistorySchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, required: true },
    answer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    isCheckpoint: { type: Boolean, required: true },
    positionBefore: { type: Number, required: true, min: 0 },
    positionAfter: { type: Number, required: true, min: 0 },
    answeredAt: { type: Date, required: true },
  },
  { _id: false }
);

const challengeProgressSchema = new Schema(
  {
    position: { type: Number, required: true, default: 0, min: 0 },
    questionIndex: { type: Number, required: true, default: 0, min: 0 },
    score: { type: Number, required: true, default: 0, min: 0 },
    pushBackPowers: { type: Number, required: true, default: 0, min: 0 },
    attemptedAnswers: { type: [String], default: [] },
    attemptedCheckpoints: { type: [Number], default: [] },
    resolvedCheckpoints: { type: [Number], default: [] },
    answerHistory: { type: [challengeAnswerHistorySchema], default: [] },
    lastAnswerCorrect: { type: Boolean, default: null },
  },
  { _id: false }
);

const challengeSubmissionSchema = new Schema(
  {
    answers: {
      type: [
        new Schema(
          {
            questionId: { type: Schema.Types.ObjectId, required: true },
            answer: { type: String, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    score: { type: Number, required: true, default: 0 },
    submittedAt: { type: Date, required: true },
  },
  { _id: false }
);

const trackerClanChallengeSchema = new Schema(
  {
    trackerId: { type: Schema.Types.ObjectId, ref: 'Tracker', required: true, index: true },
    challengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    opponentId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    participantIds: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    challengeType: { type: String, enum: ['open', 'direct'], required: true },
    status: {
      type: String,
      enum: ['open', 'pending', 'active', 'completed', 'declined', 'cancelled', 'expired'],
      required: true,
      index: true,
    },
    durationMinutes: { type: Number, required: true, min: 5, max: 30 },
    totalNodes: { type: Number, required: true, min: 3, max: 15 },
    questions: { type: [challengeQuestionSchema], required: true },
    challengerSubmission: { type: challengeSubmissionSchema, default: null },
    opponentSubmission: { type: challengeSubmissionSchema, default: null },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    acceptBy: { type: Date, required: true, index: true },
    completedAt: { type: Date, default: null },
    winnerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    quitById: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    challengerProgress: { type: challengeProgressSchema, default: () => ({}) },
    opponentProgress: { type: challengeProgressSchema, default: () => ({}) },
  },
  { timestamps: true, collection: 'tracker_clan_challenges', optimisticConcurrency: true }
);

trackerClanChallengeSchema.index({ trackerId: 1, status: 1, createdAt: -1 });
trackerClanChallengeSchema.index({ challengerId: 1, opponentId: 1, status: 1 });
trackerClanChallengeSchema.index(
  { participantIds: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active', participantIds: { $exists: true } },
  }
);

export type TrackerClanChallengeDocument = InferSchemaType<
  typeof trackerClanChallengeSchema
> & { _id: mongoose.Types.ObjectId };

export const TrackerClanChallenge =
  mongoose.models.TrackerClanChallenge ||
  mongoose.model('TrackerClanChallenge', trackerClanChallengeSchema);
