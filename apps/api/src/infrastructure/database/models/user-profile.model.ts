import mongoose, { Schema, model, type InferSchemaType } from 'mongoose';

const userProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    fullName: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },

    headline: {
      type: String,
      trim: true,
      maxlength: 160,
      default: '',
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: '',
    },

    location: {
      type: String,
      trim: true,
      maxlength: 180,
      default: '',
    },

    education: {
      type: String,
      trim: true,
      maxlength: 220,
      default: '',
    },

    skills: {
      type: [String],
      default: [],
    },

    interests: {
      type: [String],
      default: [],
    },

    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },

    linkedinUrl: {
      type: String,
      trim: true,
      default: '',
    },

    portfolioUrl: {
      type: String,
      trim: true,
      default: '',
    },

    profileBannerUrl: {
      type: String,
      trim: true,
      default: '',
    },

    publicProfileEnabled: {
      type: Boolean,
      default: true,
    },

    publishedCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    cloneCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    ratingAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    likeCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'user_profiles',
  }
);

userProfileSchema.index({ userId: 1, deletedAt: 1 });

export type UserProfileDocument = InferSchemaType<typeof userProfileSchema>;

export const UserProfile = mongoose.models.UserProfile || model('UserProfile', userProfileSchema);
