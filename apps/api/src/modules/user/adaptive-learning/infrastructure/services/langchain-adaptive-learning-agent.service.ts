import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { Annotation, END, START, StateGraph } from '@langchain/langgraph'
import { z } from 'zod'

import { env } from '../../../../../config/env'
import type {
  AdaptiveAdvisorAnswer,
  AdaptiveAssessmentPlan,
  AdaptiveLearnerSnapshot,
  AdaptiveProfile,
} from '../../domain/adaptive-learning.types'
import type { IAdaptiveLearningAgent } from '../../domain/services/adaptive-learning-agent.interface'

const assessmentPlanSchema = z.object({
  topic: z.string().min(2).max(120),
  trackerId: z.string().nullable(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionCount: z.number().int().min(5).max(20),
  predictedScore: z.number().min(0).max(100),
  rationale: z.string().min(10).max(800),
  focusAreas: z.array(z.string().min(1).max(100)).min(1).max(5),
})

const advisorResponseSchema = z.object({
  content: z.string().min(2).max(1200),
  action: z
    .discriminatedUnion('type', [
      z.object({
        type: z.literal('create_tracker'),
        label: z.string().min(2).max(80),
        topic: z.string().min(2).max(200),
        goal: z.string().min(2).max(400),
        level: z.enum(['beginner', 'intermediate', 'advanced']),
      }),
      z.object({
        type: z.literal('create_mock_test'),
        label: z.string().min(2).max(80),
        topic: z.string().min(2).max(200),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        questionCount: z.number().int().min(5).max(20),
        trackerId: z.string().nullable(),
      }),
    ])
    .nullable(),
})

const AssessmentState = Annotation.Root({
  snapshot: Annotation<AdaptiveLearnerSnapshot>(),
  profile: Annotation<AdaptiveProfile>(),
  proposedPlan: Annotation<z.infer<typeof assessmentPlanSchema> | undefined>(),
  plan: Annotation<AdaptiveAssessmentPlan | undefined>(),
})

export class LangChainAdaptiveLearningAgent
  implements IAdaptiveLearningAgent
{
  private readonly _model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: env.GEMINI_API_KEY,
    temperature: 0.2,
    maxOutputTokens: 1600,
  })

  async planAssessment(input: {
    snapshot: AdaptiveLearnerSnapshot
    profile: AdaptiveProfile
  }): Promise<AdaptiveAssessmentPlan> {
    const structuredModel = this._model.withStructuredOutput(
      assessmentPlanSchema,
      { name: 'adaptive_assessment_plan' },
    )

    const graph = new StateGraph(AssessmentState)
      .addNode('analyze_learner', async (state) => {
        const proposedPlan = await structuredModel.invoke([
          {
            role: 'system',
            content:
              'You are an adaptive assessment planner. Choose exactly one useful exam based only on the supplied learner data. Prefer weak areas and currently studied trackers. Predict the score realistically; do not reward or punish the learner yet.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              adaptiveProfile: state.profile,
              learnerData: state.snapshot,
            }),
          },
        ])
        return { proposedPlan }
      })
      .addNode('calibrate_plan', (state) => {
        if (!state.proposedPlan) {
          throw new Error('Adaptive assessment graph produced no plan')
        }

        const trackerIds = new Set(state.snapshot.trackers.map((item) => item.id))
        const selectedTracker = state.proposedPlan.trackerId
          ? state.snapshot.trackers.find(
              (tracker) => tracker.id === state.proposedPlan?.trackerId,
            )
          : undefined
        const fallbackTracker = [...state.snapshot.trackers].sort(
          (a, b) => a.progressPercent - b.progressPercent,
        )[0]
        const tracker = selectedTracker ?? fallbackTracker

        const plan: AdaptiveAssessmentPlan = {
          topic: state.proposedPlan.topic || tracker?.field || tracker?.title,
          ...(tracker && trackerIds.has(tracker.id) ? { trackerId: tracker.id } : {}),
          difficulty: state.proposedPlan.difficulty,
          questionCount: Math.max(
            5,
            Math.min(20, Math.round(state.proposedPlan.questionCount)),
          ),
          predictedScore: Math.max(
            20,
            Math.min(95, Math.round(state.proposedPlan.predictedScore)),
          ),
          rationale: state.proposedPlan.rationale,
          focusAreas: [...new Set(state.proposedPlan.focusAreas)].slice(0, 5),
        }
        return { plan }
      })
      .addEdge(START, 'analyze_learner')
      .addEdge('analyze_learner', 'calibrate_plan')
      .addEdge('calibrate_plan', END)
      .compile()

    try {
      const result = await graph.invoke({
        snapshot: input.snapshot,
        profile: input.profile,
      })
      if (result.plan) return result.plan
    } catch (error) {
      console.error('[AdaptiveLearning] Assessment graph failed:', error)
    }

    return this.fallbackPlan(input.snapshot)
  }

  async answer(
    input: Parameters<IAdaptiveLearningAgent['answer']>[0],
  ): Promise<AdaptiveAdvisorAnswer> {
    const structuredModel = this._model.withStructuredOutput(
      advisorResponseSchema,
      { name: 'adaptive_advisor_response' },
    )
    const response = await structuredModel.invoke([
      {
        role: 'system',
        content: [
          'You are Immi, a concise adaptive learning advisor.',
          'Use the learner data to recommend a concrete next step.',
          'If you explicitly recommend creating a new tracker, include a create_tracker action with everything required to generate it immediately.',
          'If you explicitly recommend taking a new mock test, include a create_mock_test action with everything required to generate it immediately.',
          'Do not add an action when recommending continuing an existing tracker, opening an existing test, or when more clarification is needed.',
          'Never claim the action has already happened. Be honest when evidence is limited.',
        ].join(' '),
      },
      {
        role: 'user',
        content: JSON.stringify({
          question: input.question,
          adaptiveProfile: input.profile,
          learnerData: input.snapshot,
          conversation: input.history,
        }),
      },
    ])
    const validTrackerIds = new Set(
      input.snapshot.trackers.map((tracker) => tracker.id),
    )

    if (!response.action) return { content: response.content }
    if (response.action.type === 'create_tracker') {
      return { content: response.content, action: response.action }
    }

    const { trackerId, ...mockTestAction } = response.action
    return {
      content: response.content,
      action:
        trackerId && validTrackerIds.has(trackerId)
          ? { ...mockTestAction, trackerId }
          : mockTestAction,
    }
  }

  private fallbackPlan(snapshot: AdaptiveLearnerSnapshot): AdaptiveAssessmentPlan {
    const tracker = [...snapshot.trackers].sort(
      (a, b) => a.progressPercent - b.progressPercent,
    )[0]
    const weakTopics = snapshot.recentPerformance
      .flatMap((item) => item.weakTopics)
      .filter((topic, index, all) => all.indexOf(topic) === index)
      .slice(0, 4)
    const predictedScore = snapshot.averageScore ?? 60

    return {
      topic: weakTopics[0] || tracker.field || tracker.title,
      trackerId: tracker.id,
      difficulty:
        predictedScore >= 75 ? 'hard' : predictedScore >= 50 ? 'medium' : 'easy',
      questionCount: 10,
      predictedScore: Math.max(25, Math.min(90, predictedScore)),
      rationale:
        'This assessment targets your current learning path and recent performance.',
      focusAreas: weakTopics.length > 0 ? weakTopics : [tracker.field || tracker.title],
    }
  }
}
