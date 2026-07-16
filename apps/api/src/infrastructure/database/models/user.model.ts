import mongoose, { Document, Schema } from 'mongoose';

export interface IUserDocument extends Document {
  _id: mongoose.Types.ObjectId;

  fullName: string;
  username: string;

  email?: string;
  phone?: string;

  passwordHash: string | null;

  avatarUrl?: string;

  role: 'user' | 'admin' | 'moderator' | 'superadmin';
  status: 'active' | 'paused' | 'blocked' | 'deactivated' | 'banned';
  adminStatusReason?: string | null;
  adminStatusReasonCode?: string | null;
  adminStatusChangedAt?: Date | null;
  adminStatusChangedBy?: mongoose.Types.ObjectId | null;
  adminTags?: string[];

  emailVerified: boolean;
  phoneVerified: boolean;

  // Pending email change verification
  pendingEmail?: string | null;
  pendingEmailChangeTokenHash?: string | null;
  pendingEmailChangeExpiresAt?: Date | null;
  pendingEmailChangeRequestedAt?: Date | null;

  // Scheduled account deletion grace period
  deletionRequestedAt?: Date | null;
  scheduledDeletionAt?: Date | null;

  provider: 'local' | 'google' | 'github';
  providerId?: string;

  referralCode?: string;
  referredBy?: mongoose.Types.ObjectId | null;

  coins: number;

  // Student/learning progression
  xp: number;
  level: number;

  // Teacher/community contribution progression
  teacherXp: number;
  teacherLevel: number;

  streakCount: number;

  isPremium: boolean;
  onboardingCompleted: boolean;

  lastActiveAt: Date;
  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Shared student and teacher level thresholds:
 * Level 1: 0-499 XP
 * Level 2: 500-1299 XP
 * Level 3: 1300-2399 XP
 * Level 4: 2400-3799 XP
 *
 * After the first 500 XP, the XP required for each next level increases
 * by 300: 800, 1100, 1400, 1700, ...
 */
export function calculateProgressionLevelFromXp(xp: number): number {
  const normalizedXp = Math.max(Math.floor(xp), 0);

  let level = 1;
  let nextLevelAt = 500;
  let requiredXpIncrease = 800;

  while (normalizedXp >= nextLevelAt) {
    level += 1;
    nextLevelAt += requiredXpIncrease;
    requiredXpIncrease += 300;
  }

  return level;
}

export function calculateStudentLevelFromXp(xp: number): number {
  return calculateProgressionLevelFromXp(xp);
}

export function calculateTeacherLevelFromXp(teacherXp: number): number {
  return calculateProgressionLevelFromXp(teacherXp);
}

const userSchema = new Schema<IUserDocument>(
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

    adminStatusReason: { type: String, trim: true, maxlength: 1000, default: null },
    adminStatusReasonCode: { type: String, trim: true, maxlength: 80, default: null },
    adminTags: { type: [String], default: [], select: false },
    adminStatusChangedAt: { type: Date, default: null },
    adminStatusChangedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    // ─── PENDING EMAIL CHANGE ─────────────────────────────

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

    // ─── SCHEDULED ACCOUNT DELETION ───────────────────────

    deletionRequestedAt: {
      type: Date,
      default: null,
    },

    scheduledDeletionAt: {
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

    // ─── STUDENT / LEARNING PROGRESSION ──────────────────

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

    // ─── TEACHER / CONTRIBUTION PROGRESSION ──────────────

    teacherXp: {
      type: Number,
      default: 0,
      min: 0,
    },

    teacherLevel: {
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
);

// Keeps derived levels synchronized when a document is created or saved.
// Query updates such as updateOne/findOneAndUpdate do not execute this hook.
userSchema.pre('save', function (this: IUserDocument) {
  if (this.isNew || this.isModified('xp')) {
    this.level = calculateStudentLevelFromXp(this.xp);
  }

  if (this.isNew || this.isModified('teacherXp')) {
    this.teacherLevel = calculateTeacherLevelFromXp(this.teacherXp);
  }
});

// ─── INDEXES ──────────────────────────────────────────────

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: {
        $type: 'string',
      },
    },
  }
);

userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: {
        $type: 'string',
      },
    },
  }
);

userSchema.index(
  { username: 1 },
  {
    unique: true,
  }
);

userSchema.index(
  { referralCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      referralCode: {
        $type: 'string',
      },
    },
  }
);

userSchema.index({
  role: 1,
  status: 1,
});

userSchema.index({
  status: 1,
  lastActiveAt: -1,
});

userSchema.index({
  status: 1,
  scheduledDeletionAt: 1,
});

userSchema.index({
  deletedAt: 1,
});

userSchema.index({
  provider: 1,
  providerId: 1,
});

userSchema.index({
  pendingEmailChangeTokenHash: 1,
  pendingEmailChangeExpiresAt: 1,
});

// Student leaderboard: XP decides rank. Level is only a derived display value.
userSchema.index(
  {
    status: 1,
    deletedAt: 1,
    onboardingCompleted: 1,
    xp: -1,
    createdAt: 1,
    _id: 1,
  },
  {
    name: 'student_leaderboard_rank',
  }
);

// Trainer leaderboard: teacher XP decides rank.
userSchema.index(
  {
    status: 1,
    deletedAt: 1,
    onboardingCompleted: 1,
    teacherXp: -1,
    createdAt: 1,
    _id: 1,
  },
  {
    name: 'trainer_leaderboard_rank',
  }
);

export const User = mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);
