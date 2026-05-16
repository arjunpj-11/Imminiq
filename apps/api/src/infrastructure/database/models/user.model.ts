import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId

  fullName: string
  username: string

  email?: string
  phone?: string

  passwordHash: string | null

  avatarUrl?: string

  role: 'user' | 'admin' | 'moderator' | 'superadmin'
  status: 'active' | 'paused' | 'blocked' | 'deactivated' | 'banned'

  emailVerified: boolean
  phoneVerified: boolean

  // Used to auto-delete unverified accounts
  verificationExpiresAt?: Date | null

  // Pending email change verification
  pendingEmail?: string | null
  pendingEmailChangeTokenHash?: string | null
  pendingEmailChangeExpiresAt?: Date | null
  pendingEmailChangeRequestedAt?: Date | null

  provider: 'local' | 'google' | 'github'
  providerId?: string

  referralCode?: string
  referredBy?: mongoose.Types.ObjectId | null

  coins: number
  xp: number
  level: number
  streakCount: number

  isPremium: boolean
  onboardingCompleted: boolean

  lastActiveAt: Date
  deletedAt?: Date | null

  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80,
    },

    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: undefined,
    },

    phone: {
      type: String,
      trim: true,
      default: undefined,
    },

    passwordHash: {
      type: String,
      default: null,
      select: false,
    },

    avatarUrl: {
      type: String,
      trim: true,
      default: undefined,
    },

    role: {
      type: String,
      enum: ['user', 'admin', 'moderator', 'superadmin'],
      default: 'user',
    },

    status: {
      type: String,
      enum: ['active', 'paused', 'blocked', 'deactivated', 'banned'],
      default: 'active',
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    // While user is unverified, this has a future date.
    // After verification, it becomes null.
    // MongoDB TTL index deletes users when this date passes.
    verificationExpiresAt: {
      type: Date,
      default: null,
    },

    // ─── PENDING EMAIL CHANGE ─────────────────────────────
    // Current email is NOT changed immediately.
    // These fields are set when user requests an email change.
    // Email updates only after the verification link is clicked.
    pendingEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },

    pendingEmailChangeTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    pendingEmailChangeExpiresAt: {
      type: Date,
      default: null,
    },

    pendingEmailChangeRequestedAt: {
      type: Date,
      default: null,
    },

    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },

    providerId: {
      type: String,
      trim: true,
      default: undefined,
    },

    referralCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: undefined,
    },

    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    coins: {
      type: Number,
      default: 0,
      min: 0,
    },

    xp: {
      type: Number,
      default: 0,
      min: 0,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    streakCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// ─── INDEXES ─────────────────────────────────────
// Keep indexes here only. Do not also add unique/index inside fields.

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: 'string' },
    },
  }
)

userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $type: 'string' },
    },
  }
)

userSchema.index(
  { username: 1 },
  {
    unique: true,
  }
)

userSchema.index(
  { referralCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      referralCode: { $type: 'string' },
    },
  }
)

// Auto-delete unverified local accounts after verificationExpiresAt.
// Verified users will have verificationExpiresAt: null, so they are safe.
userSchema.index(
  { verificationExpiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      provider: 'local',
      emailVerified: false,
      phoneVerified: false,
      deletedAt: null,
    },
  }
)

userSchema.index({ role: 1, status: 1 })
userSchema.index({ status: 1, lastActiveAt: -1 })
userSchema.index({ deletedAt: 1 })
userSchema.index({ provider: 1, providerId: 1 })

// Helps lookup email-change verification tokens efficiently.
userSchema.index({
  pendingEmailChangeTokenHash: 1,
  pendingEmailChangeExpiresAt: 1,
})

export const User = mongoose.model<IUser>('User', userSchema)