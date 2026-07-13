import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { Annotation, END, START, StateGraph } from '@langchain/langgraph'
import { createAgent, tool } from 'langchain'
import { z } from 'zod'

import { env } from '../../../../../config/env'
import type {
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

const AssessmentState = Annotation.Root({
  snapshot: Annotation<AdaptiveLearnerSnapshot>(),
  profile: Annotation<AdaptiveProfile>(),
  proposedPlan: Annotation<z.infer<typeof assessmentPlanSchema> | undefined>(),
  plan: Annotation<AdaptiveAssessmentPlan | undefined>(),
})

const contentAsText = (content: unknown): string => {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content
    .map((part) => {
      if (typeof part === 'string') return part
      if (part && typeof part === 'object' && 'text' in part) {
        const text = (part as { text?: unknown }).text
        return typeof text === 'string' ? text : ''
      }
      return ''
    })
    .filter(Boolean)
    .join('\n')
}

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

  async answer(input: Parameters<IAdaptiveLearningAgent['answer']>[0]) {
    const learnerProfileTool = tool(
      async () =>
        JSON.stringify({
          adaptiveMastery: input.profile,
          accountProgress: input.snapshot.user,
        }),
      {
        name: 'get_learning_profile',
        description: 'Read the learner mastery, XP, level, and streak.',
        schema: z.object({}),
      },
    )
    const trackerTool = tool(
      async () => JSON.stringify(input.snapshot.trackers),
      {
        name: 'get_current_trackers',
        description:
          'Read the learner trackers, goals, levels, and completion progress.',
        schema: z.object({}),
      },
    )
    const performanceTool = tool(
      async () => JSON.stringify(input.snapshot.recentPerformance),
      {
        name: 'get_mock_test_performance',
        description:
          'Read recent mock-test scores, strong topics, and weak topics.',
        schema: z.object({}),
      },
    )

    const agent = createAgent({
      model: this._model,
      tools: [learnerProfileTool, trackerTool, performanceTool],
      systemPrompt:
        'You are Immi, a concise adaptive learning advisor. Use tools when learner data is relevant. Recommend concrete next study steps, an existing tracker to continue, a useful mock test, or a new tracker topic. Never claim an action was created; you only advise. Be honest when evidence is limited. Do not expose private implementation details or hidden reasoning.',
    })

    const result = await agent.invoke({
      messages: [
        ...input.history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { role: 'user' as const, content: input.question },
      ],
    })
    const lastMessage = result.messages.at(-1)
    const answer = contentAsText(lastMessage?.content).trim()

    return answer || 'I could not form a recommendation yet. Complete a lesson or mock test and ask me again.'
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
