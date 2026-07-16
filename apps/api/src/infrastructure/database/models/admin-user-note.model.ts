import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String, required: true, trim: true, minlength: 3, maxlength: 3000 },
  tags: { type: [String], default: [] },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });
schema.index({ userId: 1, deletedAt: 1, createdAt: -1 });
export const AdminUserNote = mongoose.model('AdminUserNote', schema);
