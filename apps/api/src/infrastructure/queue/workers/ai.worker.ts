import mongoose from 'mongoose';
import { randomBytes } from 'crypto';
import { Worker } from 'bullmq';
import { redis } from '../../../config/redis';
import { env } from '../../../config/env';

import { AIGenerationJob } from '../../database/models/ai-generation-job.model';
import { AIGenerationStep } from '../../database/models/ai-generation-step.model';
import { AdaptiveAssessmentModel } from '../../database/models/adaptive-assessment.model';
import { Tracker } from '../../database/models/tracker.model';
import { TrackerTopic } from '../../database/models/tracker-topic.model';
import { TrackerSubtopic } from '../../database/models/tracker-subtopic.model';
import { createActivityComposition } from '../../../modules/user/activity';
import { createMockTestsComposition } from '../../../modules/user/mock-tests';
import { createNotificationsComposition } from '../../../modules/notifications';
import { subscriptionLimitService } from '../../../modules/user/subscriptions';

import { generateRoadmapStructure, evaluateRoadmap, RoadmapNestedNode } from '../../ai/ai.service';
import {
  findTrackerSubtopicLearningVideos,
  findTrackerTopicLearningVideos,
  LearningVideoRecommendation,
} from '../../youtube/youtube-learning-video.service';

// ============================================================
// GEMINI RATE-LIMIT SETTINGS
// ============================================================

const ONE_MINUTE_MS = 60_000;

// ============================================================
// HELPERS
// ============================================================

const createSlug = (title: string) => {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  const suffix = `${Date.now()}-${randomBytes(4).toString('hex')}`;

  return `${base}-${suffix}`;
};

const startStep = async (jobId: string, stepNumber: number) => {
  await Promise.all([
    AIGenerationJob.findByIdAndUpdate(jobId, {
      status: 'processing',
      currentStep: stepNumber,
      ...(stepNumber === 1 ? { startedAt: new Date() } : {}),
    }),

    AIGenerationStep.findOneAndUpdate(
      {
        jobId,
        stepNumber,
      },
      {
        status: 'active',
        startedAt: new Date(),
      },
      {
        returnDocument: 'after',
      }
    ),
  ]);
};

const completeStep = async (jobId: string, stepNumber: number) => {
  await AIGenerationStep.findOneAndUpdate(
    {
      jobId,
      stepNumber,
    },
    {
      status: 'completed',
      completedAt: new Date(),
    },
    {
      returnDocument: 'after',
    }
  );
};

const resetCurrentActiveStepToPending = async (jobId: string) => {
  const aiJob = await AIGenerationJob.findById(jobId);

  if (!aiJob?.currentStep) return;

  await AIGenerationStep.findOneAndUpdate(
    {
      jobId,
      stepNumber: aiJob.currentStep,
      status: 'active',
    },
    {
      status: 'pending',
      startedAt: null,
      completedAt: null,
    }
  );

  await AIGenerationJob.findByIdAndUpdate(jobId, {
    status: 'pending',
  });
};

const failCurrentStep = async (jobId: string) => {
  const aiJob = await AIGenerationJob.findById(jobId);

  if (!aiJob?.currentStep) return;

  await AIGenerationStep.findOneAndUpdate(
    {
      jobId,
      stepNumber: aiJob.currentStep,
    },
    {
      status: 'failed',
      completedAt: new Date(),
    }
  );
};

const countNestedNodes = (nodes: RoadmapNestedNode[]): number => {
  return nodes.reduce((total, node) => {
    return total + 1 + countNestedNodes(node.children || []);
  }, 0);
};

const saveNestedSubtopics = async ({
  trackerId,
  topicId,
  parentSubtopicId,
  nodes,
  depth,
  topicOrder,
  learningVideos,
  session,
}: {
  trackerId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  parentSubtopicId: mongoose.Types.ObjectId | null;
  nodes: RoadmapNestedNode[];
  depth: number;
  topicOrder: number;
  learningVideos: Map<string, LearningVideoRecommendation>;
  session: mongoose.ClientSession;
}) => {
  for (const node of nodes) {
    const createdSubtopics = await TrackerSubtopic.create(
      [
        {
          trackerId,
          topicId,
          parentSubtopicId,
          title: node.title,
          description: node.description || '',
          order: node.order,
          depth,
          isLocked: true,
          estimatedMinutes: 0,
          learningVideo:
            depth === 1 ? learningVideos.get(`${topicOrder}:${node.order}`) || null : null,
        },
      ],
      {
        session,
      }
    );

    const createdSubtopic = createdSubtopics[0];

    if (node.children?.length) {
      await saveNestedSubtopics({
        trackerId,
        topicId,
        parentSubtopicId: createdSubtopic._id as mongoose.Types.ObjectId,
        nodes: node.children,
        depth: depth + 1,
        topicOrder,
        learningVideos,
        session,
      });
    }
  }
};

type EvaluationSubtopicNode = {
  _id: string;
  title: string;
  description: string;
  order: number;
  depth: number;
  children: EvaluationSubtopicNode[];
};

const getRoadmapTreeForEvaluation = async (trackerId: string) => {
  const tracker = await Tracker.findById(trackerId);

  const topics = await TrackerTopic.find({
    trackerId,
    deletedAt: null,
  }).sort({
    order: 1,
  });

  const subtopics = await TrackerSubtopic.find({
    trackerId,
    deletedAt: null,
  }).sort({
    depth: 1,
    order: 1,
  });

  const subtopicMap = new Map<string, EvaluationSubtopicNode>();

  for (const subtopic of subtopics) {
    subtopicMap.set(subtopic._id.toString(), {
      _id: subtopic._id.toString(),
      title: subtopic.title,
      description: subtopic.description,
      order: subtopic.order,
      depth: subtopic.depth,
      children: [],
    });
  }

  const topicChildrenMap = new Map<string, EvaluationSubtopicNode[]>();

  for (const topic of topics) {
    topicChildrenMap.set(topic._id.toString(), []);
  }

  for (const subtopic of subtopics) {
    const currentNode = subtopicMap.get(subtopic._id.toString());

    if (!currentNode) continue;

    if (subtopic.parentSubtopicId) {
      const parentNode = subtopicMap.get(subtopic.parentSubtopicId.toString());

      if (parentNode) {
        parentNode.children.push(currentNode);
      }

      continue;
    }

    const rootChildren = topicChildrenMap.get(subtopic.topicId.toString());

    if (rootChildren) {
      rootChildren.push(currentNode);
    }
  }

  const roadmapTopics = topics.map((topic) => ({
    _id: topic._id.toString(),
    title: topic.title,
    description: topic.description,
    order: topic.order,
    children: topicChildrenMap.get(topic._id.toString()) || [],
  }));

  return {
    tracker,
    topics: roadmapTopics,
  };
};

// ============================================================
// GEMINI RATE-LIMIT ERROR DETECTOR
// ============================================================

const isGeminiTemporaryError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const possibleError = error as {
    status?: number;
    statusCode?: number;
    message?: string;
  };

  const message = possibleError.message?.toLowerCase() || '';

  return (
    possibleError.status === 429 ||
    possibleError.statusCode === 429 ||
    possibleError.status === 503 ||
    possibleError.statusCode === 503 ||
    message.includes('429') ||
    message.includes('503') ||
    message.includes('resource_exhausted') ||
    message.includes('rate limit') ||
    message.includes('quota') ||
    message.includes('service unavailable') ||
    message.includes('high demand') ||
    message.includes('unavailable')
  );
};

// ============================================================
// ROADMAP GENERATION JOB
// ============================================================

const processRoadmapGeneration = async (
  jobId: string,
  userId: string,
  topic: string,
  goal: string | undefined,
  level: 'beginner' | 'intermediate' | 'advanced'
) => {
  // Step 1 — Analyse goal
  await startStep(jobId, 1);
  await completeStep(jobId, 1);

  // Step 2 — Prepare roadmap mapping
  await startStep(jobId, 2);
  await completeStep(jobId, 2);

  // Step 3 — Gemini roadmap generation
  await startStep(jobId, 3);

  const roadmap = await generateRoadmapStructure(topic, goal, level);

  const meaningfulSubtopics = roadmap.topics.flatMap((roadmapTopic) => {
    const section = (roadmapTopic.children || []).find(
      (child) =>
        Boolean(child.children?.length) &&
        !/^(?:quiz|practice|exercise|revision|recap|interview|common pitfalls?)/i.test(
          child.title.trim()
        )
    );

    return section
      ? [
          {
            key: `${roadmapTopic.order}:${section.order}`,
            title: section.title,
            parentTopicTitle: roadmapTopic.title,
          },
        ]
      : [];
  });

  const [learningVideos, subtopicLearningVideos] = await Promise.all([
    findTrackerTopicLearningVideos({
      trackerTitle: topic,
      topics: roadmap.topics.map((roadmapTopic) => ({
        title: roadmapTopic.title,
        order: roadmapTopic.order,
      })),
    }),
    findTrackerSubtopicLearningVideos({
      trackerTitle: topic,
      subtopics: meaningfulSubtopics,
    }),
  ]);

  await completeStep(jobId, 3);

  // Step 4 — Save tracker tree to MongoDB
  await startStep(jobId, 4);

  await subscriptionLimitService.enforce(userId, 'tracker_capacity');

  const session = await mongoose.startSession();

  let createdTrackerId: mongoose.Types.ObjectId | null = null;

  try {
    await session.withTransaction(async () => {
      const slug = createSlug(roadmap.title);

      const totalSubtopicCount = roadmap.topics.reduce((total, topicItem) => {
        return total + countNestedNodes(topicItem.children || []);
      }, 0);

      const trackers = await Tracker.create(
        [
          {
            ownerId: userId,

            title: roadmap.title,
            slug,
            description: roadmap.description,

            category: 'general',
            field: topic,
            goal: goal || '',

            level,

            visibility: 'private',
            status: 'draft',

            isAIGenerated: true,
            aiJobId: jobId,

            topicsCount: roadmap.topics.length,
            subtopicsCount: totalSubtopicCount,

            cloneCount: 0,
            likeCount: 0,
            saveCount: 0,

            progressPercent: 0,
            ratingAverage: 0,
            ratingCount: 0,
          },
        ],
        {
          session,
        }
      );

      const tracker = trackers[0];

      createdTrackerId = tracker._id as mongoose.Types.ObjectId;

      for (let topicIndex = 0; topicIndex < roadmap.topics.length; topicIndex++) {
        const topicData = roadmap.topics[topicIndex];

        const savedTopics = await TrackerTopic.create(
          [
            {
              trackerId: tracker._id,
              title: topicData.title,
              description: topicData.description || '',
              order: topicData.order,
              learningVideo: learningVideos.get(topicData.order) || null,
              status: topicIndex === 0 ? 'active' : 'locked',
              estimatedHours: 0,
              progressPercent: 0,
            },
          ],
          {
            session,
          }
        );

        const savedTopic = savedTopics[0];

        if (topicData.children?.length) {
          await saveNestedSubtopics({
            trackerId: tracker._id as mongoose.Types.ObjectId,
            topicId: savedTopic._id as mongoose.Types.ObjectId,
            parentSubtopicId: null,
            nodes: topicData.children,
            depth: 1,
            topicOrder: topicData.order,
            learningVideos: subtopicLearningVideos,
            session,
          });
        }
      }
    });
  } finally {
    await session.endSession();
  }

  await completeStep(jobId, 4);

  if (!createdTrackerId) {
    throw new Error('Tracker was not created');
  }

  const trackerId = createdTrackerId as mongoose.Types.ObjectId;

  // Step 5 — Finalise
  await startStep(jobId, 5);

  await AIGenerationJob.findByIdAndUpdate(jobId, {
    status: 'completed',
    currentStep: 5,
    completedAt: new Date(),
    outputData: {
      trackerId: trackerId.toString(),
    },
  });

  await completeStep(jobId, 5);

  await createNotificationsComposition().useCases.createNotification.execute({
    userId,
    type: 'tracker_generation_completed',
    message: `Your tracker “${roadmap.title}” is ready. Go and check it out.`,
    deepLink: `/onboarding/roadmap-ready/${jobId}`,
    metadata: { jobId, trackerId: trackerId.toString() },
  });
};

// ============================================================
// ROADMAP EVALUATION JOB
// ============================================================

const processRoadmapEvaluation = async (
  jobId: string,
  trackerId: string,
  sourceRoadmapJobId: string
) => {
  // Step 1 — Load generated roadmap reference
  await startStep(jobId, 1);
  await completeStep(jobId, 1);

  // Step 2 — Build full roadmap tree for Gemini
  await startStep(jobId, 2);

  const roadmap = await getRoadmapTreeForEvaluation(trackerId);

  if (!roadmap.tracker) {
    throw new Error('Generated tracker not found');
  }

  await completeStep(jobId, 2);

  // Step 3 — Gemini evaluation
  await startStep(jobId, 3);

  const evaluation = await evaluateRoadmap(roadmap);

  await completeStep(jobId, 3);

  // Step 4 — Prepare and store result payload
  await startStep(jobId, 4);

  await AIGenerationJob.findByIdAndUpdate(jobId, {
    outputData: {
      trackerId,
      sourceRoadmapJobId,
      evaluation,
    },
  });

  await completeStep(jobId, 4);

  // Step 5 — Finalise evaluation job
  await startStep(jobId, 5);

  await AIGenerationJob.findByIdAndUpdate(jobId, {
    status: 'completed',
    currentStep: 5,
    completedAt: new Date(),
    outputData: {
      trackerId,
      sourceRoadmapJobId,
      evaluation,
    },
  });

  await completeStep(jobId, 5);
};

// ============================================================
// WORKER
// ============================================================

export const aiWorker = new Worker(
  'ai',
  async (job) => {
    const { jobId } = job.data as {
      jobId: string;
    };

    try {
      if (job.name === 'generate-roadmap') {
        const { userId, topic, goal, level } = job.data as {
          jobId: string;
          userId: string;
          topic: string;
          goal?: string;
          level: 'beginner' | 'intermediate' | 'advanced';
        };

        await processRoadmapGeneration(jobId, userId, topic, goal, level);

        return;
      }

      if (job.name === 'evaluate-roadmap') {
        const { trackerId, sourceRoadmapJobId } = job.data as {
          jobId: string;
          userId: string;
          trackerId: string;
          sourceRoadmapJobId: string;
        };

        await processRoadmapEvaluation(jobId, trackerId, sourceRoadmapJobId);

        return;
      }

      if (job.name === 'generate-mock-test') {
        const { userId, payload, adaptiveContext } = job.data as {
          jobId: string;
          userId: string;
          payload: Parameters<
            ReturnType<typeof createMockTestsComposition>['useCases']['generateMockTest']['execute']
          >[1];
          adaptiveContext?: {
            plan: {
              topic: string;
              trackerId?: string;
              difficulty: 'easy' | 'medium' | 'hard';
              questionCount: number;
              predictedScore: number;
              rationale: string;
              focusAreas: string[];
            };
            baselineMasteryScore: number;
          };
        };
        await AIGenerationJob.findByIdAndUpdate(jobId, {
          status: 'processing',
          currentStep: 1,
          startedAt: new Date(),
        });
        const activity = createActivityComposition();
        const mockTests = createMockTestsComposition(activity.useCases.recordActivity);
        const test = await mockTests.useCases.generateMockTest.execute(userId, payload);
        if (adaptiveContext) {
          await AdaptiveAssessmentModel.create({
            userId,
            testId: test._id,
            trackerId: adaptiveContext.plan.trackerId ?? null,
            topic: adaptiveContext.plan.topic,
            difficulty: adaptiveContext.plan.difficulty,
            questionCount: adaptiveContext.plan.questionCount,
            predictedScore: adaptiveContext.plan.predictedScore,
            rationale: adaptiveContext.plan.rationale,
            focusAreas: adaptiveContext.plan.focusAreas,
            baselineMasteryScore: adaptiveContext.baselineMasteryScore,
          });
        }
        await AIGenerationJob.findByIdAndUpdate(jobId, {
          status: 'completed',
          currentStep: 1,
          completedAt: new Date(),
          outputData: { testId: test._id },
        });
        await createNotificationsComposition().useCases.createNotification.execute({
          userId,
          type: 'mock_test_generation_completed',
          message: adaptiveContext
            ? `Your adaptive assessment “${test.title}” is ready.`
            : `Your mock test “${test.title}” is ready. Go and check it out.`,
          deepLink: `/mock-tests/${test._id}`,
          metadata: { jobId, testId: test._id },
        });
        return;
      }
    } catch (error) {
      if (isGeminiTemporaryError(error)) {
        console.warn('⚠️ Gemini rate limit hit. Pausing AI queue for 60 seconds.');

        await aiWorker.rateLimit(ONE_MINUTE_MS);

        await resetCurrentActiveStepToPending(jobId);

        throw Worker.RateLimitError();
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown AI job failure';

      await failCurrentStep(jobId);

      await AIGenerationJob.findByIdAndUpdate(jobId, {
        status: 'failed',
        errorMessage,
        completedAt: new Date(),
      });

      const failedJob = await AIGenerationJob.findById(jobId).lean();
      if (failedJob?.jobType === 'mock_test') {
        await createNotificationsComposition().useCases.createNotification.execute({
          userId: failedJob.userId.toString(),
          type: 'mock_test_generation_failed',
          message: 'We could not generate your mock test. Please try again.',
          deepLink: '/mock-tests',
          metadata: { jobId },
        });
      }

      throw error;
    }
  },
  {
    connection: redis,
    autorun: false,

    concurrency: env.AI_WORKER_CONCURRENCY,

    limiter: {
      max: env.AI_WORKER_REQUESTS_PER_MINUTE,
      duration: ONE_MINUTE_MS,
    },
  }
);

let workerStarted = false;

export const startAiWorker = async () => {
  if (workerStarted) return;
  workerStarted = true;

  void aiWorker.run().catch((error: unknown) => {
    if (!aiWorker.closing) {
      console.error('AI worker stopped unexpectedly', error);
    }
  });
  await aiWorker.waitUntilReady();

  console.log('✅ AI Worker running with roadmap generation + evaluation support');
};
