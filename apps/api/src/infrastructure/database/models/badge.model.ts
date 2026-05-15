import mongoose, {
  Schema,
  model,
  type InferSchemaType,
} from 'mongoose'

const badgeSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxlength: 500,
    },
    iconUrl: {
      type: String,
      trim: true,
      default: '',
    },
    badgeType: {
      type: String,
      enum: ['streak', 'test', 'tracker', 'battle', 'community'],
      required: true,
      index: true,
    },
    criteria: {
      type: Schema.Types.Mixed,
      default: {},
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'badges',
  }
)

badgeSchema.index({ badgeType: 1, deletedAt: 1 })

export type BadgeDocument = InferSchemaType<typeof badgeSchema>

export const Badge = mongoose.models.Badge || model('Badge', badgeSchema)
