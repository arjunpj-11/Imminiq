import type { ITrackerQueryRepository } from '../../domain/repositories/tracker-query.repository.interface';
import { TrackerApplicationError } from '../tracker-application.error';
import type { ReportTrackerPayloadDTO, ReportTrackerResultDTO } from '../tracker.dto';

export interface IReportTrackerUseCase {
  execute(input: ReportTrackerPayloadDTO): Promise<ReportTrackerResultDTO>;
}

export class ReportTrackerUseCase implements IReportTrackerUseCase {
  constructor(
    private readonly repository: Pick<
      ITrackerQueryRepository,
      'findReportableTrackerById' | 'createOrReopenTrackerReport'
    >
  ) {}

  async execute(input: ReportTrackerPayloadDTO) {
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
