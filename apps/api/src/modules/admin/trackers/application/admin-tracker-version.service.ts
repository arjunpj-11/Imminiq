import type { AdminActor } from '../../../../shared/admin';

export type AdminTrackerVersionDTO = {
  id: string;
  trackerId: string;
  version: number;
  snapshot: Record<string, unknown>;
  changedBy: string;
  reason?: string;
  createdAt: Date;
};

export type AdminTrackerVersionRestoreResultDTO = {
  trackerId: string;
  restoredVersion: number;
  newVersion: number;
  updatedAt: Date;
};

export interface IAdminTrackerVersionService {
  list(trackerId: string): Promise<AdminTrackerVersionDTO[]>;
  restore(
    trackerId: string,
    version: number,
    reason: string,
    actor: AdminActor
  ): Promise<AdminTrackerVersionRestoreResultDTO>;
}
