import {
  AIGenerationJob,
  type AIGenerationJobType,
} from '../database/models/ai-generation-job.model';

const ENQUEUE_FAILURE_MESSAGE = 'Generation could not be queued. Please try again.';
const STALE_GENERATION_MESSAGE = 'Generation did not start in time. Please try again.';
const DEFAULT_STALE_AFTER_MS = 30 * 60 * 1000;

export type ActiveAIGenerationJob = {
  jobId: string;
  status: 'pending' | 'processing';
};

export const findActiveAIJob = async (input: {
  userId: string;
  jobType: AIGenerationJobType;
  staleAfterMs?: number;
}): Promise<ActiveAIGenerationJob | null> => {
  const staleBefore = new Date(Date.now() - (input.staleAfterMs ?? DEFAULT_STALE_AFTER_MS));

  await AIGenerationJob.updateMany(
    {
      userId: input.userId,
      jobType: input.jobType,
      status: { $in: ['pending', 'processing'] },
      deletedAt: null,
      updatedAt: { $lt: staleBefore },
    },
    {
      $set: {
        status: 'failed',
        errorMessage: STALE_GENERATION_MESSAGE,
        completedAt: new Date(),
      },
    }
  );

  const job = await AIGenerationJob.findOne({
    userId: input.userId,
    jobType: input.jobType,
    status: { $in: ['pending', 'processing'] },
    deletedAt: null,
  })
    .sort({ createdAt: -1 })
    .select('_id status')
    .lean<{ _id: { toString(): string }; status: 'pending' | 'processing' }>();

  return job ? { jobId: job._id.toString(), status: job.status } : null;
};

export const enqueueAIJobOrMarkFailed = async (
  jobId: string,
  enqueue: () => Promise<unknown>
): Promise<void> => {
  try {
    await enqueue();
  } catch (error) {
    await AIGenerationJob.findByIdAndUpdate(jobId, {
      status: 'failed',
      errorMessage: ENQUEUE_FAILURE_MESSAGE,
      completedAt: new Date(),
    });
    throw error;
  }
};
