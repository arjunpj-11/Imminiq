import { z } from 'zod';

const objectId = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Identifier is invalid');
const page = z.coerce.number().int().min(1).default(1);
const limit = z.coerce.number().int().min(1).max(100).default(30);

export const listChatSchema = z.object({
  page,
  limit,
  search: z.string().trim().min(1).max(120).optional(),
  before: z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
});
export const conversationParamsSchema = z.object({ conversationId: objectId });
export const createConversationSchema = z.object({ friendUserId: objectId });
export const messageParamsSchema = z.object({ messageId: objectId });
export const userBlockParamsSchema = z.object({ userId: objectId });
export const forwardChatMessageSchema = z.object({ targetConversationId: objectId });
export const shareTrackerSchema = z.object({
  trackerId: objectId,
  targetConversationId: objectId,
});
export const shareProfileSchema = z.object({
  username: z.string().trim().toLowerCase().min(3).max(30),
  targetConversationId: objectId,
});
export const blockUserSchema = z.object({ userId: objectId });
export const sendChatMessageSchema = z
  .object({
    kind: z.enum(['text', 'code', 'image', 'file', 'voice']).default('text'),
    text: z.string().trim().max(4000).optional(),
    codeLanguage: z.string().trim().max(40).optional(),
    durationSeconds: z.coerce.number().int().min(1).max(600).optional(),
    replyToMessageId: objectId.optional(),
  })
  .superRefine((value, context) => {
    if (value.kind === 'code' && !value.text) {
      context.addIssue({
        code: 'custom',
        path: ['text'],
        message: 'Code messages cannot be empty',
      });
    }
    if (value.kind === 'voice' && !value.durationSeconds) {
      context.addIssue({
        code: 'custom',
        path: ['durationSeconds'],
        message: 'Voice message duration is required',
      });
    }
  });

export const editChatMessageSchema = z.object({
  text: z.string().trim().min(1, 'Message cannot be empty').max(4000),
});

export const chatReactionSchema = z.object({
  emoji: z.enum(['👍', '❤️', '😂', '🎉', '🤔', '👏']),
});
