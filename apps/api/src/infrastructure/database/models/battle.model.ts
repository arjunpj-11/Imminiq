// apps/api/src/infrastructure/database/models/battle.model.ts

import mongoose, { Document, Schema } from 'mongoose'

export type BattleStatus =
  | 'waiting'
  | 'live'
  | 'completed'

export interface IBattle extends Document {
  challengeId: mongoose.Types.ObjectId
  playerOneId: mongoose.Types.ObjectId
  playerTwoId: mongoose.Types.ObjectId
  winnerId?: mongoose.Types.ObjectId
  status: BattleStatus
  battleMap?: Record<string, unknown>
  startedAt?: Date
  endedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const battleSchema = new Schema<IBattle>(
  {
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
    },

    playerOneId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    playerTwoId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    winnerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    status: {
      type: String,
      enum: ['waiting', 'live', 'completed'],
      default: 'waiting',
    },

    battleMap: {
      type: Schema.Types.Mixed,
      default: {},
    },

    startedAt: {
      type: Date,
    },

    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

battleSchema.index({
  challengeId: 1,
  status: 1,
})

battleSchema.index({
  playerOneId: 1,
  status: 1,
})

battleSchema.index({
  playerTwoId: 1,
  status: 1,
})

export const Battle = mongoose.model<IBattle>(
  'Battle',
  battleSchema
)