import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { z } from 'zod'

import { env } from '../../../../../config/env'
import { MockTestReportModel } from '../../../../../infrastructure/database/models/mock-test-report.model'
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model'
import { User } from '../../../../../infrastructure/database/models/user.model'
import type {
  ITrackerIntakeAgent,
  TrackerIntakeMessage,
} from '../../domain/services/tracker-intake-agent.interface'

const trackerIntakeResponseSchema = z.object({
  assistantMessage: z.string().min(2).max(500),
  isComplete: z.boolean(),
  profile: z
    .object({
      topic: z.string().min(2).max(200),
      motivation: z.string().min(2).max(300),
      desiredOutcome: z.string().min(2).max(300),
      currentExperience: z.string().min(1).max(200),
      weeklyTimeCommitment: z.string().min(1).max(100),
      learningPreferences: z.array(z.string().min(1).max(100)).max(5),
      constraints: z.array(z.string().min(1).max(100)).max(5),
      inferredLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    })
    .optional(),
})

export class LangChainTrackerIntakeAgent implements ITrackerIntakeAgent {
  private readonly _model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: env.GEMINI_API_KEY,
    temperature: 0.25,
    maxOutputTokens: 900,
  })

  async continueIntake(userId: string, messages: TrackerIntakeMessage[]) {
    const model = this._model.withStructuredOutput(trackerIntakeResponseSchema, {
      name: 'tracker_intake_response',
    })
    const userAnswerCount = messages.filter(
      (message) => message.role === 'user',
    ).length
    const [user, trackers, recentReports] = await Promise.all([
      User.findById(userId).select('xp level streakCount').lean(),
      Tracker.find({ ownerId: userId, deletedAt: null })
        .select('title field goal level progressPercent')
        .sort({ updatedAt: -1 })
        .limit(8)
        .lean(),
      MockTestReportModel.find({ userId })
        .select('scorePercentage weakTopics strongTopics')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ])
    const learnerContext = {
      account: user
        ? { xp: user.xp, xpLevel: user.level, streakCount: user.streakCount }
        : null,
      trackers: trackers.map((tracker) => ({
        title: tracker.title,
        field: tracker.field,
        goal: tracker.goal,
        level: tracker.level,
        progressPercent: tracker.progressPercent,
      })),
      recentTests: recentReports.map((report) => ({
        scorePercentage: report.scorePercentage,
        weakTopics: report.weakTopics,
        strongTopics: report.strongTopics,
      })),
    }

    const response = await model.invoke([
      {
        role: 'system',
        content: [
          'You are Immi, a friendly learning-roadmap intake assistant.',
          'Ask exactly one short, useful follow-up question at a time.',
          'Gather: the precise subject, why it matters, desired outcome, existing experience or current level, weekly time, preferred learning style, and important constraints or deadline.',
          'Use the supplied prior learner data to avoid repeated questions and to assess experience, but ask a short level question when the evidence is unclear or the new topic differs from prior study.',
          'Infer beginner, intermediate, or advanced in the completed profile. There is no separate level-selection screen.',
          'Do not repeat a question already answered. Infer reasonable details when the learner already gave them.',
          'Mark isComplete true once there is enough information for a personalized roadmap, normally after 3-6 user answers.',
          'When complete, include the full profile and use assistantMessage to briefly confirm what you understood.',
          `There have been ${userAnswerCount} user answers. If there are 6 or more, complete using the best available information instead of continuing indefinitely.`,
          `Prior learner data: ${JSON.stringify(learnerContext)}.`,
        ].join(' '),
      },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ])

    if (response.isComplete && !response.profile) {
      return {
        assistantMessage:
          'I have most of it. What exact outcome would make this roadmap successful for you?',
        isComplete: false,
      }
    }

    return response
  }
}

export const langChainTrackerIntakeAgent = new LangChainTrackerIntakeAgent()
