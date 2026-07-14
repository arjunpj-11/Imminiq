import { z } from 'zod';

export const subscriptionOrderSchema = z.object({
  planId: z.enum(['pro', 'premium']),
  billingCycle: z.enum(['monthly', 'annual']),
});

export const subscriptionVerificationSchema = z.object({
  razorpayOrderId: z.string().trim().min(1).max(120),
  razorpayPaymentId: z.string().trim().min(1).max(120),
  razorpaySignature: z.string().trim().regex(/^[a-f0-9]{64}$/i),
});
