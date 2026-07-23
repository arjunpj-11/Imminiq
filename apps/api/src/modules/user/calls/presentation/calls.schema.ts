import { z } from 'zod';

export const callIdParamsSchema = z.object({
  callId: z.string().regex(/^[a-f\d]{24}$/i, 'Call identifier is invalid'),
});

export const listCallsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const initiateCallSchema = z.object({
  calleeUserId: z.string().regex(/^[a-f\d]{24}$/i, 'Call participant is invalid'),
  type: z.enum(['audio', 'video']),
  reason: z.string().trim().min(3, 'Enter a reason for the call').max(240),
});

export const respondCallSchema = z.object({
  response: z.enum(['accept', 'decline']),
});

export const endCallSchema = z.object({
  outcome: z.enum(['ended', 'missed', 'cancelled']),
});
