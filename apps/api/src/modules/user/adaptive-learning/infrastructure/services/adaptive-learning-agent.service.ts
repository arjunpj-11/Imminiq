import { z } from 'zod';

import { env } from '../../../../../config/env';
import {
  economyAIChatWithFallback,
  economyAIStructuredWithFallback,
} from '../../../../../infrastructure/ai/ai.service';
import { parseAIJson } from '../../../../../infrastructure/ai/ai-json.parser';
import type {
  AdaptiveAdvisorAnswer,
  AdaptiveAssessmentPlan,
  AdaptiveLearnerSnapshot,
  AdaptiveProfile,
} from '../../domain/adaptive-learning.types';
import type { IAdaptiveLearningAgent } from '../../domain/services/adaptive-learning-agent.interface';

const assessmentPlanSchema = z.object({
  topic: z.string().min(2).max(120),
  trackerId: z.string().nullable(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionCount: z.number().int().min(5).max(20),
  predictedScore: z.number().min(0).max(100),
  rationale: z.string().min(10).max(800),
  focusAreas: z.array(z.string().min(1).max(100)).min(1).max(5),
});

const advisorResponseSchema = z.preprocess(
  normalizeAdvisorResponse,
  z.object({
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
          type: z.literal('browse_community_trackers'),
          label: z.string().min(2).max(80),
          topic: z.string().min(2).max(200),
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
);

function normalizeAdvisorResponse(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;

  const response = value as Record<string, unknown>;
  const action = response.action;
  if (action === null || action === undefined || typeof action !== 'object') {
    return { ...response, action: null };
  }

  const actionRecord = action as Record<string, unknown>;
  if (actionRecord.type === 'create_tracker' || actionRecord.type === 'create_mock_test') {
    return response;
  }

  if (actionRecord.type === 'browse_community_trackers') {
    return response;
  }

  const nestedTracker = actionRecord.create_tracker;
  if (nestedTracker && typeof nestedTracker === 'object') {
    const tracker = nestedTracker as Record<string, unknown>;
    // Models sometimes wrap an existing tracker as a create action. Continuing
    // an existing tracker must not create a duplicate.
    if (tracker.trackerId || tracker.tracker_id || tracker.id) {
      return { ...response, action: null };
    }

    const topic = tracker.topic ?? tracker.field ?? tracker.title;
    return {
      ...response,
      action: {
        type: 'create_tracker',
        label: tracker.label ?? (typeof topic === 'string' ? `Create ${topic}` : undefined),
        topic,
        goal: tracker.goal,
        level: tracker.level,
      },
    };
  }

  const nestedTest = actionRecord.create_mock_test;
  if (nestedTest && typeof nestedTest === 'object') {
    const test = nestedTest as Record<string, unknown>;
    const topic = test.topic ?? test.title;
    return {
      ...response,
      action: {
        type: 'create_mock_test',
        label: test.label ?? (typeof topic === 'string' ? `Test ${topic}` : undefined),
        topic,
        difficulty: test.difficulty,
        questionCount: test.questionCount ?? test.question_count,
        trackerId: test.trackerId ?? test.tracker_id ?? null,
      },
    };
  }

  return { ...response, action: null };
}

type ProposedAssessmentPlan = z.infer<typeof assessmentPlanSchema>;

export class AdaptiveLearningAgent implements IAdaptiveLearningAgent {
  async planAssessment(input: {
    snapshot: AdaptiveLearnerSnapshot;
    profile: AdaptiveProfile;
  }): Promise<AdaptiveAssessmentPlan> {
    try {
      const proposedPlan = await this.proposeAssessmentPlan(input);
      return this.calibrateAssessmentPlan(proposedPlan, input.snapshot);
    } catch (error) {
      console.error('[AdaptiveLearning] Assessment planning failed:', error);
    }

    return this.fallbackPlan(input.snapshot);
  }

  private async proposeAssessmentPlan(input: {
    snapshot: AdaptiveLearnerSnapshot;
    profile: AdaptiveProfile;
  }): Promise<ProposedAssessmentPlan> {
    return economyAIStructuredWithFallback(
      [
        {
          role: 'system',
          content:
            'You are an adaptive assessment planner. Choose exactly one useful exam based only on the supplied learner data. Prefer weak areas and currently studied trackers. Predict the score realistically; do not reward or punish the learner yet. Return only JSON with topic, trackerId (string or null), difficulty (easy, medium, or hard), questionCount, predictedScore, rationale, and focusAreas.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            adaptiveProfile: input.profile,
            learnerData: input.snapshot,
          }),
        },
      ],
      (rawResponse) => parseAIJson(rawResponse, assessmentPlanSchema),
      'fast',
      'adaptive_learning',
      {
        operation: 'adaptive-assessment-plan',
        temperature: env.AI_ADAPTIVE_ASSESSMENT_TEMPERATURE,
      }
    );
  }

  private calibrateAssessmentPlan(
    proposedPlan: ProposedAssessmentPlan,
    snapshot: AdaptiveLearnerSnapshot
  ): AdaptiveAssessmentPlan {
    const trackerIds = new Set(snapshot.trackers.map((item) => item.id));
    const selectedTracker = proposedPlan.trackerId
      ? snapshot.trackers.find((tracker) => tracker.id === proposedPlan.trackerId)
      : undefined;
    const fallbackTracker = [...snapshot.trackers].sort(
      (a, b) => a.progressPercent - b.progressPercent
    )[0];
    const tracker = selectedTracker ?? fallbackTracker;

    return {
      topic: proposedPlan.topic || tracker?.field || tracker?.title,
      ...(tracker && trackerIds.has(tracker.id) ? { trackerId: tracker.id } : {}),
      difficulty: proposedPlan.difficulty,
      questionCount: Math.max(5, Math.min(20, Math.round(proposedPlan.questionCount))),
      predictedScore: Math.max(20, Math.min(95, Math.round(proposedPlan.predictedScore))),
      rationale: proposedPlan.rationale,
      focusAreas: [...new Set(proposedPlan.focusAreas)].slice(0, 5),
    };
  }

  async answer(
    input: Parameters<IAdaptiveLearningAgent['answer']>[0]
  ): Promise<AdaptiveAdvisorAnswer> {
    const learnerContext = JSON.stringify({
      question: input.question,
      adaptiveProfile: input.profile,
      learnerData: input.snapshot,
      conversation: input.history,
    });
    let response: z.infer<typeof advisorResponseSchema>;
    try {
      response = await economyAIStructuredWithFallback(
        [
          {
            role: 'system',
            content: [
              'You are Immi, a concise adaptive learning advisor.',
              'Use the learner data to recommend a concrete next step.',
              'When the learner explicitly asks for a community tracker, set action to {"type":"browse_community_trackers","label":string,"topic":string} so they can review matching community paths before creating anything.',
              'Only recommend creating a new tracker when the learner has no tracker for that subject. If an existing tracker has a matching title, field, or goal, recommend continuing it and set action to null. If the learner already has three or more trackers, prioritize completing one of them and set action to null.',
              'If you explicitly recommend creating a new tracker, set action to {"type":"create_tracker","label":string,"topic":string,"goal":string,"level":"beginner"|"intermediate"|"advanced"}.',
              'If you explicitly recommend taking a new mock test, set action to {"type":"create_mock_test","label":string,"topic":string,"difficulty":"easy"|"medium"|"hard","questionCount":number,"trackerId":string|null}.',
              'Do not add an action when recommending continuing an existing tracker, opening an existing test, or when more clarification is needed.',
              'Never put create_tracker or create_mock_test as a nested key. The discriminator must always be action.type.',
              'Never claim the action has already happened. Be honest when evidence is limited.',
              'Return only JSON with content and action. Set action to null when no creation is needed.',
            ].join(' '),
          },
          {
            role: 'user',
            content: learnerContext,
          },
        ],
        (rawResponse) => parseAIJson(rawResponse, advisorResponseSchema),
        'fast',
        'adaptive_learning',
        {
          operation: 'adaptive-learning-advisor',
          temperature: env.AI_ADAPTIVE_ADVISOR_TEMPERATURE,
        }
      );
    } catch (error) {
      console.error('[AdaptiveLearning] Structured advisor responses failed:', error);
      try {
        const content = await economyAIChatWithFallback(
          [
            {
              role: 'system',
              content:
                'You are Immi, a concise adaptive learning advisor. Answer the learner directly in plain text using their question, recent performance, weak topics, and active trackers. Give one concrete next step. Do not return JSON and do not claim you performed an action.',
            },
            { role: 'user', content: learnerContext },
          ],
          'fast',
          'adaptive_learning',
          {
            operation: 'adaptive-learning-advisor-text-recovery',
            temperature: env.AI_ADAPTIVE_ADVISOR_TEMPERATURE,
          }
        );
        const cleanContent = content.trim().slice(0, 1200);
        if (cleanContent) return { content: cleanContent };
      } catch (recoveryError) {
        console.error('[AdaptiveLearning] Text advisor recovery failed:', recoveryError);
      }
      return this.fallbackAnswer(input);
    }
    const validTrackerIds = new Set(input.snapshot.trackers.map((tracker) => tracker.id));

    if (!response.action) return { content: response.content };
    if (response.action.type === 'create_tracker') {
      const existingTracker = this.findMatchingTracker(input.snapshot, response.action.topic);
      if (existingTracker) {
        return {
          content: `You already have “${existingTracker.title}”, which covers ${existingTracker.field}. Continue that tracker instead of creating another one for the same subject.`,
        };
      }
      if (input.snapshot.trackers.length >= 3) {
        return {
          content: response.content,
        };
      }
      return { content: response.content, action: response.action };
    }

    if (response.action.type === 'browse_community_trackers') {
      return { content: response.content, action: response.action };
    }

    const { trackerId, ...mockTestAction } = response.action;
    return {
      content: response.content,
      action:
        trackerId && validTrackerIds.has(trackerId)
          ? { ...mockTestAction, trackerId }
          : mockTestAction,
    };
  }

  private fallbackAnswer(
    input: Parameters<IAdaptiveLearningAgent['answer']>[0]
  ): AdaptiveAdvisorAnswer {
    const question = input.question.trim();
    const normalizedQuestion = question.toLowerCase();
    const tracker = [...input.snapshot.trackers].sort(
      (a, b) => a.progressPercent - b.progressPercent
    )[0];
    const recentTest = [...input.snapshot.recentPerformance].sort(
      (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
    )[0];
    const weakTopics = input.snapshot.recentPerformance
      .flatMap((item) => item.weakTopics)
      .filter((topic, index, all) => all.indexOf(topic) === index);
    const focus = weakTopics[0] || tracker?.field || tracker?.title;

    if (!tracker) {
      return {
        content: `For “${question.slice(0, 120)}”, start by creating a tracker for the subject you want to improve. Once you complete a few lessons or a mock test, I can make the recommendation more specific.`,
      };
    }

    if (/\b(test|exam|quiz|assessment)\b/.test(normalizedQuestion)) {
      const score = recentTest?.scorePercentage ?? input.snapshot.averageScore ?? 60;
      const difficulty = score >= 75 ? 'hard' : score >= 50 ? 'medium' : 'easy';
      const topic = focus || tracker.title;
      return {
        content: `Take a short ${difficulty} mock test on ${topic}. Your${recentTest ? ` latest score in “${recentTest.title}” was ${Math.round(recentTest.scorePercentage)}%, so this will check whether the weak area has improved` : ' current learning record needs a fresh baseline'}.`,
        action: {
          type: 'create_mock_test',
          label: `Test ${topic}`,
          topic,
          difficulty,
          questionCount: 10,
          trackerId: tracker.id,
        },
      };
    }

    if (/\b(weak|mistake|improve|struggl|difficult|hard)\b/.test(normalizedQuestion) && focus) {
      return {
        content: `Focus next on ${focus} inside “${tracker.title}”. Review one lesson, solve a few targeted questions, and then use a short mock test to confirm the improvement.`,
      };
    }

    const scoreContext = recentTest
      ? ` Your latest recorded score is ${Math.round(recentTest.scorePercentage)}% in “${recentTest.title}”.`
      : '';
    return {
      content: `For “${question.slice(0, 120)}”, continue “${tracker.title}”, currently ${Math.round(tracker.progressPercent)}% complete, and finish one focused lesson${focus ? ` on ${focus}` : ''}.${scoreContext}`,
    };
  }

  private findMatchingTracker(snapshot: AdaptiveLearnerSnapshot, topic: string) {
    const normalizedTopic = this.normalizeTopic(topic);
    if (!normalizedTopic) return undefined;

    return snapshot.trackers.find((tracker) =>
      [tracker.title, tracker.field, tracker.goal].some((value) => {
        const normalizedValue = this.normalizeTopic(value);
        return (
          normalizedValue === normalizedTopic ||
          normalizedValue.includes(normalizedTopic) ||
          normalizedTopic.includes(normalizedValue)
        );
      })
    );
  }

  private nextTrackerToContinue(snapshot: AdaptiveLearnerSnapshot) {
    return [...snapshot.trackers].sort((a, b) => a.progressPercent - b.progressPercent)[0];
  }

  private normalizeTopic(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  private fallbackPlan(snapshot: AdaptiveLearnerSnapshot): AdaptiveAssessmentPlan {
    const tracker = [...snapshot.trackers].sort((a, b) => a.progressPercent - b.progressPercent)[0];
    const weakTopics = snapshot.recentPerformance
      .flatMap((item) => item.weakTopics)
      .filter((topic, index, all) => all.indexOf(topic) === index)
      .slice(0, 4);
    const predictedScore = snapshot.averageScore ?? 60;

    return {
      topic: weakTopics[0] || tracker.field || tracker.title,
      trackerId: tracker.id,
      difficulty: predictedScore >= 75 ? 'hard' : predictedScore >= 50 ? 'medium' : 'easy',
      questionCount: 10,
      predictedScore: Math.max(25, Math.min(90, predictedScore)),
      rationale: 'This assessment targets your current learning path and recent performance.',
      focusAreas: weakTopics.length > 0 ? weakTopics : [tracker.field || tracker.title],
    };
  }
}
