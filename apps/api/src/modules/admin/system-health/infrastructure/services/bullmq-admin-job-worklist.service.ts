import type { Job, JobState, Queue } from 'bullmq';
import { AIGenerationJob } from '../../../../../infrastructure/database/models/ai-generation-job.model';
import { recordAdminAction } from '../../../../../infrastructure/admin';
import { aiQueue, analyticsQueue, emailQueue, notificationQueue, streakQueue } from '../../../../../infrastructure/queue/queues';
import type { AdminActor } from '../../../../../shared/admin';
import { ApiError } from '../../../../../shared/utils/ApiError';
import type {
  AdminJobWorklistQuery,
  IAdminJobWorklistService,
} from '../../application/admin-job-worklist.service';

const queues = new Map<string, Queue>(
  [aiQueue, emailQueue, notificationQueue, analyticsQueue, streakQueue].map((queue) => [
    queue.name,
    queue,
  ])
);
const visibleStates: JobState[] = ['waiting', 'active', 'delayed', 'completed', 'failed'];

export class BullMqAdminJobWorklistService implements IAdminJobWorklistService {
  async list(query: AdminJobWorklistQuery) {
    const selectedQueues = query.queue && query.queue !== 'all'
      ? [this.requireQueue(query.queue)]
      : [...queues.values()];
    const requestedStates = query.status && query.status !== 'all'
      ? [query.status as JobState]
      : visibleStates;
    const jobs = (
      await Promise.all(
        selectedQueues.map(async (queue) => {
          const rows = await queue.getJobs(requestedStates, 0, 499, false);
          return Promise.all(rows.map(async (job) => this.toItem(queue.name, job)));
        })
      )
    )
      .flat()
      .sort((left, right) => Number(right.timestamp) - Number(left.timestamp));
    const start = (query.page - 1) * query.limit;
    return {
      items: jobs.slice(start, start + query.limit),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: jobs.length,
        pages: Math.max(1, Math.ceil(jobs.length / query.limit)),
      },
    };
  }

  async act(
    queueName: string,
    jobId: string,
    action: 'cancel' | 'retry' | 'remove',
    actor: AdminActor
  ) {
    const queue = this.requireQueue(queueName);
    const job = await queue.getJob(jobId);
    if (!job) throw new ApiError(404, 'Queue job not found', 'QUEUE_JOB_NOT_FOUND');
    const state = await job.getState();

    if (action === 'cancel') {
      if (!['waiting', 'delayed'].includes(state)) {
        throw new ApiError(
          409,
          state === 'active'
            ? 'Active work cannot be force-removed safely. Let it finish, then remove it.'
            : 'Only queued or delayed work can be cancelled',
          'QUEUE_JOB_NOT_CANCELLABLE'
        );
      }
      await job.remove();
      await this.markAIJobCancelled(job);
    } else if (action === 'retry') {
      if (state !== 'failed') {
        throw new ApiError(409, 'Only failed work can be retried', 'QUEUE_JOB_NOT_RETRYABLE');
      }
      await job.retry();
      await this.markAIJobPending(job);
    } else {
      if (!['completed', 'failed'].includes(state)) {
        throw new ApiError(409, 'Only completed or failed work can be removed', 'QUEUE_JOB_NOT_REMOVABLE');
      }
      await job.remove();
    }

    await recordAdminAction(actor, `queue_job.${action}`, 'admin.system-health', {
      queue: queueName,
      jobId,
      previousState: state,
      applicationJobId: this.applicationJobId(job),
    });
    return { queue: queueName, jobId, action, state };
  }

  private requireQueue(name: string) {
    const queue = queues.get(name);
    if (!queue) throw new ApiError(404, 'Queue not found', 'QUEUE_NOT_FOUND');
    return queue;
  }

  private async toItem(queue: string, job: Job) {
    const state = await job.getState();
    return {
      id: String(job.id),
      queue,
      name: job.name,
      state,
      progress: typeof job.progress === 'number' ? job.progress : 0,
      attemptsMade: job.attemptsMade,
      maxAttempts: job.opts.attempts ?? 1,
      timestamp: job.timestamp,
      processedOn: job.processedOn ?? null,
      finishedOn: job.finishedOn ?? null,
      failedReason: job.failedReason || null,
      applicationJobId: this.applicationJobId(job),
    };
  }

  private applicationJobId(job: Job) {
    const data = job.data as Record<string, unknown>;
    const value = data.jobId ?? data.broadcastId ?? data.notificationId;
    return value ? String(value) : null;
  }

  private async markAIJobCancelled(job: Job) {
    const applicationJobId = this.applicationJobId(job);
    if (!applicationJobId) return;
    await AIGenerationJob.updateOne(
      { _id: applicationJobId, status: 'pending' },
      {
        $set: {
          status: 'failed',
          errorMessage: 'Cancelled by an administrator before processing started.',
          completedAt: new Date(),
        },
      }
    );
  }

  private async markAIJobPending(job: Job) {
    const applicationJobId = this.applicationJobId(job);
    if (!applicationJobId) return;
    await AIGenerationJob.updateOne(
      { _id: applicationJobId },
      { $set: { status: 'pending', errorMessage: null, completedAt: null } }
    );
  }
}

export const bullMqAdminJobWorklistService = new BullMqAdminJobWorklistService();
