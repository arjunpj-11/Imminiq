import type {
  ITrackerCreationAIJobProcessor,
  ITrackerCreationCapacityEnforcer,
  ITrackerCreationJobNotifier,
  RoadmapEvaluationJobPayload,
  RoadmapGenerationJobPayload,
} from '../../application/ports/tracker-creation-ai-job-processor.interface';
import mongoose from 'mongoose';
import { randomBytes } from 'crypto';

import { AIGenerationJob } from '../../../../../infrastructure/database/models/ai-generation-job.model';
import { AIGenerationStep } from '../../../../../infrastructure/database/models/ai-generation-step.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { TrackerTopic } from '../../../../../infrastructure/database/models/tracker-topic.model';
import { TrackerSubtopic } from '../../../../../infrastructure/database/models/tracker-subtopic.model';

import type {
  RoadmapNestedNode} from '../../../../../infrastructure/ai/ai.service';
import {
  generateRoadmapStructure,
  evaluateRoadmap,
  evaluateCloneFreshness
} from '../../../../../infrastructure/ai/ai.service';
import type {
  LearningVideoRecommendation} from '../../../../../infrastructure/youtube/youtube-learning-video.service';
import {
  findTrackerSubtopicLearningVideos,
  findTrackerTopicLearningVideos
} from '../../../../../infrastructure/youtube/youtube-learning-video.service';

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
// ROADMAP GENERATION JOB
// ============================================================

const processRoadmapGeneration = async (
  jobId: string,
  userId: string,
  topic: string,
  goal: string | undefined,
  level: 'beginner' | 'intermediate' | 'advanced',
  preferredLanguage: string,
  capacityEnforcer: ITrackerCreationCapacityEnforcer,
  notifier: ITrackerCreationJobNotifier
) => {
  // Step 1 — Analyse goal
  await startStep(jobId, 1);
  await completeStep(jobId, 1);

  // Step 2 — Prepare roadmap mapping
  await startStep(jobId, 2);
  await completeStep(jobId, 2);

  // Step 3 — Gemini roadmap generation
  await startStep(jobId, 3);

  const roadmap = await generateRoadmapStructure(topic, goal, level, preferredLanguage);

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

  await capacityEnforcer.enforceTrackerCapacity(userId);

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
            contentLanguage: preferredLanguage,

            level,

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

  await notifier.notifyTrackerGenerated({
    userId,
    jobId,
    trackerId: trackerId.toString(),
    trackerTitle: roadmap.title,
  });
};

// ============================================================
// ROADMAP EVALUATION JOB
// ============================================================

const processRoadmapEvaluation = async (
  jobId: string,
  trackerId: string,
  options: {
    sourceRoadmapJobId?: string;
    sourceTrackerId?: string;
    sourceTrackerCreatedAt?: string;
    analysisKind?: 'generated_roadmap' | 'clone_freshness';
  }
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

  const evaluation =
    options.analysisKind === 'clone_freshness' && options.sourceTrackerCreatedAt
      ? await evaluateCloneFreshness(roadmap, options.sourceTrackerCreatedAt)
      : await evaluateRoadmap(roadmap);

  await completeStep(jobId, 3);

  // Step 4 — Prepare and store result payload
  await startStep(jobId, 4);

  await AIGenerationJob.findByIdAndUpdate(jobId, {
    outputData: {
      trackerId,
      ...options,
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
      ...options,
      evaluation,
    },
  });

  await completeStep(jobId, 5);

  if (options.analysisKind === 'clone_freshness') {
    await Tracker.updateOne(
      { _id: trackerId, cloneFreshnessAnalysisJobId: jobId },
      {
        $set: {
          cloneFreshnessAnalysisStatus: 'completed',
          cloneFreshnessAnalyzedAt: new Date(),
        },
      }
    );
  }
};

// ============================================================
// WORKER
// ============================================================


export class TrackerCreationAIJobProcessor implements ITrackerCreationAIJobProcessor {
  constructor(
    private readonly capacityEnforcer: ITrackerCreationCapacityEnforcer,
    private readonly notifier: ITrackerCreationJobNotifier
  ) {}

  processRoadmapGeneration(payload: RoadmapGenerationJobPayload): Promise<void> {
    return processRoadmapGeneration(
      payload.jobId,
      payload.userId,
      payload.topic,
      payload.goal,
      payload.level,
      payload.preferredLanguage,
      this.capacityEnforcer,
      this.notifier
    );
  }

  processRoadmapEvaluation(payload: RoadmapEvaluationJobPayload): Promise<void> {
    const { jobId, trackerId, ...options } = payload;
    return processRoadmapEvaluation(jobId, trackerId, options);
  }
}
