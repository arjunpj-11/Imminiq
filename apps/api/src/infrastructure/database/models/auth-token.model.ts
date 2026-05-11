import mongoose, { Document, Schema } from 'mongoose'

export interface IAuthToken extends Document {
  _id: mongoose.Types.ObjectId

  userId: mongoose.Types.ObjectId

  refreshTokenHash: string

  device?: string | null
  ipAddress?: string | null
  userAgent?: string | null

  expiresAt: Date
  revokedAt?: Date | null
  deletedAt?: Date | null

  createdAt: Date
  updatedAt: Date
}

const authTokenSchema = new Schema<IAuthToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
    },

    device: {
      type: String,
      trim: true,
      default: null,
    },

    ipAddress: {
      type: String,
      trim: true,
      default: null,
    },

    userAgent: {
      type: String,
      trim: true,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// ─── INDEXES ─────────────────────────────────────
// Keep indexes here only. Do not duplicate with unique/index inside fields.

authTokenSchema.index({ refreshTokenHash: 1 }, { unique: true })
authTokenSchema.index({ userId: 1, expiresAt: 1 })
authTokenSchema.index({ userId: 1, revokedAt: 1 })
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const AuthToken = mongoose.model<IAuthToken>(
  'AuthToken',
  authTokenSchema
)