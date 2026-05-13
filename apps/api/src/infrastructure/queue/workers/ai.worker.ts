// apps/api/src/infrastructure/queue/workers/ai.worker.ts

import mongoose from 'mongoose'
import { Worker } from 'bullmq'
import { redis } from '../../../config/redis'

import { AIGenerationJob } from '../../database/models/ai-generation-job.model'
import { AIGenerationStep } from '../../database/models/ai-generation-step.model'
import { Tracker } from '../../database/models/tracker.model'
import { TrackerTopic } from '../../database/models/tracker-topic.model'
import { TrackerSubtopic } from '../../database/models/tracker-subtopic.model'

import {
  generateRoadmapStructure,
  RoadmapNestedNode,
} from '../../ai/ai.service'

// ============================================================
// GEMINI PRO ROADMAP RATE-LIMIT SETTINGS
// ============================================================
//
// You observed your Gemini Pro free-tier limit around 2 RPM.
// So this worker will process at most:
//
//   2 roadmap generation jobs per 60 seconds
//
// Remaining jobs stay waiting in BullMQ automatically.
//

const GEMINI_PRO_ROADMAP_REQUESTS_PER_MINUTE = 2
const ONE_MINUTE_MS = 60_000

// ============================================================
// HELPERS
// ============================================================

const createSlug = (title: string) => {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

  const suffix = `${Date.now()}-${Math.floor(
    Math.random() * 10000
  )}`

  return `${base}-${suffix}`
}

const startStep = async (
  jobId: string,
  stepNumber: number
) => {
  await Promise.all([
    AIGenerationJob.findByIdAndUpdate(jobId, {
      status: 'processing',
      currentStep: stepNumber,
      ...(stepNumber === 1
        ? { startedAt: new Date() }
        : {}),
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
        new: true,
      }
    ),
  ])
}

const completeStep = async (
  jobId: string,
  stepNumber: number
) => {
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
      new: true,
    }
  )
}

const resetCurrentActiveStepToPending = async (
  jobId: string
) => {
  const aiJob = await AIGenerationJob.findById(jobId)

  if (!aiJob?.currentStep) return

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
  )

  await AIGenerationJob.findByIdAndUpdate(jobId, {
    status: 'pending',
  })
}

const failCurrentStep = async (
  jobId: string
) => {
  const aiJob = await AIGenerationJob.findById(jobId)

  if (!aiJob?.currentStep) return

  await AIGenerationStep.findOneAndUpdate(
    {
      jobId,
      stepNumber: aiJob.currentStep,
    },
    {
      status: 'failed',
      completedAt: new Date(),
    }
  )
}

const countNestedNodes = (
  nodes: RoadmapNestedNode[]
): number => {
  return nodes.reduce((total, node) => {
    return (
      total +
      1 +
      countNestedNodes(node.children || [])
    )
  }, 0)
}

const saveNestedSubtopics = async ({
  trackerId,
  topicId,
  parentSubtopicId,
  nodes,
  depth,
  session,
}: {
  trackerId: mongoose.Types.ObjectId
  topicId: mongoose.Types.ObjectId
  parentSubtopicId: mongoose.Types.ObjectId | null
  nodes: RoadmapNestedNode[]
  depth: number
  session: mongoose.ClientSession
}) => {
  for (const node of nodes) {
    const createdSubtopics =
      await TrackerSubtopic.create(
        [
          {
            trackerId,
            topicId,
            parentSubtopicId,
            title: node.title,
            description: '',
            order: node.order,
            depth,
            isLocked: true,
            estimatedMinutes: 0,
          },
        ],
        {
          session,
        }
      )

    const createdSubtopic = createdSubtopics[0]

    if (node.children?.length) {
      await saveNestedSubtopics({
        trackerId,
        topicId,
        parentSubtopicId:
          createdSubtopic._id as mongoose.Types.ObjectId,
        nodes: node.children,
        depth: depth + 1,
        session,
      })
    }
  }
}

// ============================================================
// GEMINI RATE-LIMIT ERROR DETECTOR
// ============================================================
//
// Different SDK/API errors can expose 429 in slightly different ways.
// So we safely detect:
// - HTTP status 429
// - statusCode 429
// - RESOURCE_EXHAUSTED
// - "429"
// - "quota"
// - "rate limit"
//

const isGeminiRateLimitError = (
  error: unknown
): boolean => {
  if (!error || typeof error !== 'object') {
    return false
  }

  const possibleError = error as {
    status?: number
    statusCode?: number
    message?: string
  }

  const message =
    possibleError.message?.toLowerCase() || ''

  return (
    possibleError.status === 429 ||
    possibleError.statusCode === 429 ||
    message.includes('429') ||
    message.includes('resource_exhausted') ||
    message.includes('rate limit') ||
    message.includes('quota')
  )
}

// ============================================================
// WORKER
// ============================================================

const aiWorker = new Worker(
  'ai',
  async (job) => {
    if (job.name !== 'generate-roadmap') return

    const {
      jobId,
      topic,
      goal,
      level,
      userId,
    } = job.data as {
      jobId: string
      topic: string
      goal?: string
      level: 'beginner' | 'intermediate' | 'advanced'
      userId: string
    }

    try {
      // --------------------------------------------
      // Step 1 — Analyse goal
      // --------------------------------------------
      await startStep(jobId, 1)
      await completeStep(jobId, 1)

      // --------------------------------------------
      // Step 2 — Prepare roadmap mapping
      // --------------------------------------------
      await startStep(jobId, 2)
      await completeStep(jobId, 2)

      // --------------------------------------------
      // Step 3 — Gemini Pro roadmap generation
      // --------------------------------------------
      await startStep(jobId, 3)

      const roadmap = await generateRoadmapStructure(
        topic,
        goal,
        level
      )

      await completeStep(jobId, 3)

      // --------------------------------------------
      // Step 4 — Save tracker tree to MongoDB
      // --------------------------------------------
      await startStep(jobId, 4)

      const session = await mongoose.startSession()

      let createdTrackerId:
        | mongoose.Types.ObjectId
        | null = null

      try {
        await session.withTransaction(async () => {
          const slug = createSlug(roadmap.title)

          const totalSubtopicCount =
            roadmap.topics.reduce(
              (total, topicItem) => {
                return (
                  total +
                  countNestedNodes(
                    topicItem.children || []
                  )
                )
              },
              0
            )

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
          )

          const tracker = trackers[0]

          createdTrackerId =
            tracker._id as mongoose.Types.ObjectId

          for (
            let topicIndex = 0;
            topicIndex < roadmap.topics.length;
            topicIndex++
          ) {
            const topicData =
              roadmap.topics[topicIndex]

            const savedTopics =
              await TrackerTopic.create(
                [
                  {
                    trackerId: tracker._id,
                    title: topicData.title,
                    description: '',
                    order: topicData.order,
                    status:
                      topicIndex === 0
                        ? 'active'
                        : 'locked',
                    estimatedHours: 0,
                    progressPercent: 0,
                  },
                ],
                {
                  session,
                }
              )

            const savedTopic = savedTopics[0]

            if (topicData.children?.length) {
              await saveNestedSubtopics({
                trackerId:
                  tracker._id as mongoose.Types.ObjectId,
                topicId:
                  savedTopic._id as mongoose.Types.ObjectId,
                parentSubtopicId: null,
                nodes: topicData.children,
                depth: 1,
                session,
              })
            }
          }
        })
      } finally {
        await session.endSession()
      }

      await completeStep(jobId, 4)

      if (!createdTrackerId) {
        throw new Error('Tracker was not created')
      }

      const trackerId =
        createdTrackerId as mongoose.Types.ObjectId

      // --------------------------------------------
      // Step 5 — Finalise
      // --------------------------------------------
      await startStep(jobId, 5)

      await AIGenerationJob.findByIdAndUpdate(
        jobId,
        {
          status: 'completed',
          currentStep: 5,
          completedAt: new Date(),
          outputData: {
            trackerId: trackerId.toString(),
          },
        }
      )

      await completeStep(jobId, 5)
    } catch (error) {
      // ============================================================
      // CASE 1: GEMINI RATE LIMIT HIT — PAUSE QUEUE FOR 1 MINUTE
      // ============================================================
      if (isGeminiRateLimitError(error)) {
        console.warn(
          '⚠️ Gemini rate limit hit. Pausing AI queue for 60 seconds.'
        )

        // Pause the whole BullMQ AI worker rate-limited queue
        await aiWorker.rateLimit(ONE_MINUTE_MS)

        // Put DB job back to pending-style state
        await resetCurrentActiveStepToPending(jobId)

        // Special BullMQ error:
        // moves this queue job back to waiting instead of marking it failed
        throw Worker.RateLimitError()
      }

      // ============================================================
      // CASE 2: REAL FAILURE — MARK AS FAILED
      // ============================================================
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown roadmap generation failure'

      await failCurrentStep(jobId)

      await AIGenerationJob.findByIdAndUpdate(
        jobId,
        {
          status: 'failed',
          errorMessage,
          completedAt: new Date(),
        }
      )

      throw error
    }
  },
  {
    connection: redis,

    // Process one AI roadmap job at a time.
    // This keeps behavior predictable and avoids bursty concurrent Pro calls.
    concurrency: 1,

    // At most 2 roadmap jobs can start per minute.
    // Extra jobs remain waiting automatically.
    limiter: {
      max: GEMINI_PRO_ROADMAP_REQUESTS_PER_MINUTE,
      duration: ONE_MINUTE_MS,
    },
  }
)

console.log('✅ AI Worker running with Gemini Pro rate-limit protection')