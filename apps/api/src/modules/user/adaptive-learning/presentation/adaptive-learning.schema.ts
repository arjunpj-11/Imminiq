import { z } from 'zod'

export const adaptiveAdvisorChatSchema = z.object({
  question: z.string().trim().min(2).max(2000),
})
