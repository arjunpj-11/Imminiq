import mongoose, { Schema } from 'mongoose';

const codingTestCaseSchema = new Schema(
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
    },

    explanation: {
      type: String,
      default: undefined,
    },
  },
  { _id: false }
);

const codingSchema = new Schema(
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
      type: [codingTestCaseSchema],
      default: [],
    },
  },
  { _id: false }
);

const questionBankSchema = new Schema(
  {
    bankId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
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
      index: true,
    },

    points: {
      type: Number,
      default: 1,
      min: 1,
    },

    coding: {
      type: codingSchema,
      default: undefined,
    },
  },
  { timestamps: true }
);

questionBankSchema.index({ topic: 1, difficulty: 1 });

export const QuestionBankModel =
  mongoose.models.QuestionBank || mongoose.model('QuestionBank', questionBankSchema);
