import { describe, expect, it, vi } from 'vitest';

import { ReportTrackerUseCase } from '../../src/modules/user/trackers/application/use-cases/report-tracker.usecase';
import type { ITrackerRepository } from '../../src/modules/user/trackers/domain/repositories/tracker.repository.interface';
import { reportTrackerSchema } from '../../src/modules/user/trackers/presentation/trackers.schema';

describe('tracker reports', () => {
  it('creates a normalized Other report for a public tracker', async () => {
    const repository = {
      findReportableTrackerById: vi.fn().mockResolvedValue({ ownerId: 'owner-id' }),
      createOrReopenTrackerReport: vi.fn().mockResolvedValue({
        id: 'report-id',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as unknown as ITrackerRepository;

    await new ReportTrackerUseCase(repository).execute({
      trackerId: 'tracker-id',
      userId: 'reporter-id',
      reason: 'other',
      details: '  The issue does not match a listed reason.  ',
    });

    expect(repository.createOrReopenTrackerReport).toHaveBeenCalledWith({
      trackerId: 'tracker-id',
      reporterId: 'reporter-id',
      reason: 'other',
      details: 'The issue does not match a listed reason.',
    });
  });

  it('prevents owners from reporting their own tracker', async () => {
    const repository = {
      findReportableTrackerById: vi.fn().mockResolvedValue({ ownerId: 'owner-id' }),
      createOrReopenTrackerReport: vi.fn(),
    } as unknown as ITrackerRepository;

    await expect(
      new ReportTrackerUseCase(repository).execute({
        trackerId: 'tracker-id',
        userId: 'owner-id',
        reason: 'other',
      })
    ).rejects.toMatchObject({ kind: 'forbidden', code: 'FORBIDDEN' });
    expect(repository.createOrReopenTrackerReport).not.toHaveBeenCalled();
  });

  it('accepts only supported report reasons and trims details', () => {
    expect(
      reportTrackerSchema.parse({ reason: 'privacy_concern', details: '  Personal data  ' })
    ).toEqual({ reason: 'privacy_concern', details: 'Personal data' });
    expect(
      reportTrackerSchema.parse({ reason: 'other', details: '  A different concern  ' })
    ).toEqual({ reason: 'other', details: 'A different concern' });
    expect(() => reportTrackerSchema.parse({ reason: 'other', details: '   ' })).toThrow(
      'Please describe the reason for this report'
    );
    expect(() => reportTrackerSchema.parse({ reason: 'dislike' })).toThrow();
  });
});
