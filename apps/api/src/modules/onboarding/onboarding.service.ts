// apps/api/src/modules/onboarding/onboarding.service.ts

import { onboardingRepository } from './onboarding.repository'
import { ApiError } from '../../shared/utils/ApiError'
import { aiQueue } from '../../infrastructure/queue/queues'

const ROADMAP_GENERATION_STEPS = [
  'Analysing your learning goal',
  'Mapping the main roadmap areas',
  'Building the nested topic structure',
  'Saving your roadmap',
  'Finalising',
]

type RoadmapLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'

const getTrackerIdFromOutputData = (
  outputData: Record<string, unknown> | undefined
) => {
  const trackerId = outputData?.trackerId

  return typeof trackerId === 'string'
    ? trackerId
    : null
}

export const onboardingService = {
  getStatus: async (userId: string) => {
    const response =
      await onboardingRepository.getStatus(userId)

    return {
      isCompleted: response?.isCompleted || false,

      step1Completed: Boolean(
        response?.preparingFor
      ),

      step2Completed: Boolean(
        response?.currentLevel
      ),

      completedStep: response?.completedStep || 0,

      data: response,
    }
  },

  saveStep1: async (
    userId: string,
    topic: string,
    goal?: string
  ) => {
    return onboardingRepository.saveStep1(
      userId,
      topic,
      goal
    )
  },

  saveStep2: async (
    userId: string,
    level: RoadmapLevel
  ) => {
    return onboardingRepository.saveStep2(
      userId,
      level
    )
  },

  generateRoadmap: async (
    userId: string,
    topic: string,
    goal: string | undefined,
    level: RoadmapLevel
  ) => {
    await onboardingRepository.saveStep1(
      userId,
      topic,
      goal
    )

    await onboardingRepository.saveStep2(
      userId,
      level
    )

    const aiJob =
      await onboardingRepository.createAIJob(
        userId,
        {
          topic,
          goal,
          level,
        }
      )

    await onboardingRepository.createAIJobSteps(
      aiJob._id.toString(),
      ROADMAP_GENERATION_STEPS
    )

    try {
      await aiQueue.add(
  'generate-roadmap',
  {
    jobId: aiJob._id.toString(),
    userId,
    topic,
    goal,
    level,
  },
  {
    removeOnComplete: 100,
    removeOnFail: 100,

    // Retries for non-rate-limit temporary failures.
    // Rate-limit 429 is handled specially inside the worker.
    attempts: 3,

    backoff: {
      type: 'exponential',
      delay: 30_000,
    },
  }
)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to enqueue AI roadmap generation job'

      throw new ApiError(
        500,
        message,
        'AI_QUEUE_ERROR'
      )
    }

    return {
      jobId: aiJob._id.toString(),
    }
  },

  getJobStatus: async (
    jobId: string,
    userId: string
  ) => {
    const job =
      await onboardingRepository.getJobById(jobId)

    if (!job) {
      throw new ApiError(
        404,
        'Job not found',
        'NOT_FOUND'
      )
    }

    if (job.userId.toString() !== userId) {
      throw new ApiError(
        403,
        'Forbidden',
        'FORBIDDEN'
      )
    }

    const steps =
      await onboardingRepository.getJobSteps(jobId)

    const activeStep =
      steps.find((step) => step.status === 'active') ||
      steps.find(
        (step) => step.stepNumber === job.currentStep
      )

    const completedSteps = steps.filter(
      (step) => step.status === 'completed'
    ).length

    return {
      jobId: job._id.toString(),

      status: job.status,

      currentStepNumber: job.currentStep,

      currentStep:
        activeStep?.stepLabel ||
        (job.status === 'completed'
          ? 'Complete'
          : 'Queued'),

      completedSteps,
      totalSteps: job.totalSteps,

      steps: steps.map((step) => ({
        stepNumber: step.stepNumber,
        stepLabel: step.stepLabel,
        status: step.status,
        startedAt: step.startedAt || null,
        completedAt: step.completedAt || null,
      })),

      trackerId: getTrackerIdFromOutputData(
        job.outputData
      ),

      errorMessage: job.errorMessage || null,
    }
  },

  getJobResult: async (
    jobId: string,
    userId: string
  ) => {
    const job =
      await onboardingRepository.getJobById(jobId)

    if (!job) {
      throw new ApiError(
        404,
        'Job not found',
        'NOT_FOUND'
      )
    }

    if (job.userId.toString() !== userId) {
      throw new ApiError(
        403,
        'Forbidden',
        'FORBIDDEN'
      )
    }

    if (job.status !== 'completed') {
      throw new ApiError(
        400,
        'Job not completed yet',
        'JOB_PENDING'
      )
    }

    const trackerId =
      getTrackerIdFromOutputData(job.outputData)

    if (!trackerId) {
      throw new ApiError(
        500,
        'Tracker not created',
        'SERVER_ERROR'
      )
    }

    const result =
      await onboardingRepository.getRoadmapTree(
        trackerId
      )

    if (!result.tracker) {
      throw new ApiError(
        404,
        'Generated tracker not found',
        'TRACKER_NOT_FOUND'
      )
    }

    return result
  },
}