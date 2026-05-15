import mongoose, {
  Schema,
  model,
  type InferSchemaType,
} from 'mongoose'

const uploadSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      trim: true,
      required: true,
    },
    fileType: {
      type: String,
      trim: true,
      required: true,
    },
    fileUrl: {
      type: String,
      trim: true,
      required: true,
    },
    mimeType: {
      type: String,
      trim: true,
      required: true,
    },
    sizeBytes: {
      type: Number,
      min: 0,
      required: true,
    },
    module: {
      type: String,
      trim: true,
      required: true,
    },
    referenceType: {
      type: String,
      trim: true,
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'uploads',
  }
)

uploadSchema.index({ referenceType: 1, referenceId: 1 })

export type UploadDocument = InferSchemaType<typeof uploadSchema>

export const Upload = mongoose.models.Upload || model('Upload', uploadSchema)
