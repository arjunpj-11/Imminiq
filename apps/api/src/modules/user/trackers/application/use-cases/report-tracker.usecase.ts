import type { ITrackerQueryRepository } from '../../domain/repositories/tracker-query.repository.interface';
import { TrackerApplicationError } from '../tracker-application.error';

export type ReportTrackerInput = {
  trackerId: string;
  userId: string;
  reason: string;
  details?: string;
};

export interface IReportTrackerUseCase {
  execute(input: ReportTrackerInput): Promise<{
    id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export class ReportTrackerUseCase implements IReportTrackerUseCase {
  constructor(private readonly repository: ITrackerQueryRepository) {}

  async execute(input: ReportTrackerInput) {
    const tracker = await this.repository.findReportableTrackerById(input.trackerId);
    if (!tracker) throw TrackerApplicationError.trackerNotFound();
    if (String(tracker.ownerId) === input.userId) {
      throw TrackerApplicationError.forbidden('You cannot report your own tracker');
    }
    return this.repository.createOrReopenTrackerReport({
      trackerId: input.trackerId,
      reporterId: input.userId,
      reason: input.reason,
      details: input.details?.trim() ?? '',
    });
  }
}
