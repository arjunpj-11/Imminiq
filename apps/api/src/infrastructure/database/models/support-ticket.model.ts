import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const supportTicketSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    category: { type: String, enum: ['account', 'learning', 'technical', 'billing', 'other'], default: 'other', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium', index: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open', index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolutionNote: { type: String, trim: true, maxlength: 2000, default: '' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'support_tickets' },
)

supportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 })
supportTicketSchema.index({ subject: 'text', description: 'text' })

export type SupportTicketDocument = InferSchemaType<typeof supportTicketSchema>
export const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema)
