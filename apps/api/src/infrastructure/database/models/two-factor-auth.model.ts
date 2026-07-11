import mongoose, { Document, Schema } from 'mongoose'

interface IBackupCodeDocument {
  codeHash: string
  usedAt?: Date | null
}

export interface ITwoFactorAuthDocument extends Document {
  _id: mongoose.Types.ObjectId

  userId: mongoose.Types.ObjectId

  status: 'pending' | 'active' | 'disabled'

  totpSecretEncrypted: string
  totpIssuer: string
  totpAccountLabel: string
  qrCodeUri?: string | null

  backupCodes: IBackupCodeDocument[]
  backupCodesUsed: number
  backupCodesRegeneratedAt?: Date | null

  enabledAt?: Date | null
  disabledAt?: Date | null
  lastUsedAt?: Date | null
  deletedAt?: Date | null

  createdAt: Date
  updatedAt: Date
}

const backupCodeSchema = new Schema<IBackupCodeDocument>(
  {
    codeHash: {
      type: String,
      required: true,
      select: false,
    },

    usedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
)

const twoFactorAuthSchema = new Schema<ITwoFactorAuthDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['pending', 'active', 'disabled'],
      default: 'pending',
      index: true,
    },

    totpSecretEncrypted: {
      type: String,
      required: true,
      select: false,
    },

    totpIssuer: {
      type: String,
      default: 'Imminiq',
      trim: true,
    },

    totpAccountLabel: {
      type: String,
      required: true,
      trim: true,
    },

    qrCodeUri: {
      type: String,
      default: null,
      select: false,
    },

    backupCodes: {
      type: [backupCodeSchema],
      default: [],
      select: false,
    },

    backupCodesUsed: {
      type: Number,
      default: 0,
      min: 0,
      max: 8,
    },

    backupCodesRegeneratedAt: {
      type: Date,
      default: null,
    },

    enabledAt: {
      type: Date,
      default: null,
    },

    disabledAt: {
      type: Date,
      default: null,
    },

    lastUsedAt: {
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

twoFactorAuthSchema.index({ userId: 1, status: 1 })
twoFactorAuthSchema.index({ status: 1, deletedAt: 1 })
twoFactorAuthSchema.index({ enabledAt: -1 })

export const TwoFactorAuth = mongoose.model<ITwoFactorAuthDocument>(
  'TwoFactorAuth',
  twoFactorAuthSchema
)