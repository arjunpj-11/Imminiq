import mongoose, { Schema } from 'mongoose'

const mockTestCodingTestCaseSchema = new Schema(
  {
    input: {
      type: [Schema.Types.Mixed],
      required: true,
      default: [],
    },

    expectedOutput: {
      type: Schema.Types.Mixed,
      required: true,
    },

    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },

    explanation: {
      type: String,
      default: undefined,
    },
  },
  { _id: false },
)

const mockTestCodingSchema = new Schema(
  {
    functionName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    language: {
      type: String,
      enum: ['javascript', 'typescript', 'python', 'java', 'cpp', 'c'],
      default: 'javascript',
    },

    inputTypes: {
      type: [String],
      enum: [
        'number',
        'string',
        'boolean',
        'number[]',
        'string[]',
        'boolean[]',
        'number[][]',
        'string[][]',
      ],
      default: [],
    },

    outputType: {
      type: String,
      enum: [
        'number',
        'string',
        'boolean',
        'number[]',
        'string[]',
        'boolean[]',
        'number[][]',
        'string[][]',
      ],
      default: 'number',
    },

    starterCode: {
      type: String,
      required: true,
    },

    templates: {
      javascript: {
        type: String,
        default: undefined,
      },

      typescript: {
        type: String,
        default: undefined,
      },

      python: {
        type: String,
        default: undefined,
      },

      java: {
        type: String,
        default: undefined,
      },

      cpp: {
        type: String,
        default: undefined,
      },

      c: {
        type: String,
        default: undefined,
      },
    },

    testCases: {
      type: [mockTestCodingTestCaseSchema],
      default: [],
    },
  },
  { _id: false },
)

const mockTestQuestionSchema = new Schema(
  {
    testId: {
      type: Schema.Types.ObjectId,
      ref: 'MockTest',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['mcq', 'short_answer', 'coding'],
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      default: undefined,
    },

    correctAnswer: {
      type: String,
      default: undefined,
    },

    explanation: {
      type: String,
      default: undefined,
    },

    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },

    order: {
      type: Number,
      required: true,
    },

    points: {
      type: Number,
      default: 1,
      min: 1,
    },

    coding: {
      type: mockTestCodingSchema,
      default: undefined,
    },
  },
  { timestamps: true },
)

mockTestQuestionSchema.index({ testId: 1, order: 1 }, { unique: true })

export const MockTestQuestionModel =
  mongoose.models.MockTestQuestion ||
  mongoose.model('MockTestQuestion', mockTestQuestionSchema)