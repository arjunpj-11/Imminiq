// infrastructure/database/models/question-bank-counter.model.ts
import mongoose, { Schema } from 'mongoose';

const questionBankCounterSchema = new Schema({
  _id: { type: String, required: true }, // e.g. "questionBank"
  seq: { type: Number, default: 0 },
});

export const QuestionBankCounterModel =
  mongoose.models.QuestionBankCounter ||
  mongoose.model('QuestionBankCounter', questionBankCounterSchema);
