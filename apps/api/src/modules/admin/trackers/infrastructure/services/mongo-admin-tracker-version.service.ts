import mongoose from 'mongoose';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { TrackerVersion } from '../../../../../infrastructure/database/models/tracker-version.model';
import { ServiceError } from '../../../../../shared/errors/service.error';
import type { AdminActor } from '../../../../../shared/admin';
import { recordAdminAction } from '../../../../../infrastructure/admin';
import type {
  AdminTrackerVersionRestoreResultDTO,
  IAdminTrackerVersionService,
} from '../../application/admin-tracker-version.service';

const restorable = ['title', 'description', 'category', 'field', 'goal', 'level', 'tags', 'allowClone', 'visibility', 'status', 'coverImageUrl'] as const;
export class AdminTrackerVersionService implements IAdminTrackerVersionService {
  async list(trackerId: string) {
    const rows = await TrackerVersion.find({ trackerId }).populate('changedBy', 'fullName username').sort({ version: -1 }).lean();
    return rows.map((row) => { const actor = row.changedBy as unknown as { fullName?: string; username?: string }; return { id: String(row._id), trackerId, version: row.version, snapshot: row.snapshot, changedBy: actor?.fullName ?? actor?.username ?? 'Unknown', reason: row.reason, createdAt: row.createdAt }; });
  }
  async restore(trackerId: string, version: number, reason: string, actor: AdminActor) {
    const session = await mongoose.startSession();
    try {
      let output: AdminTrackerVersionRestoreResultDTO | undefined;
      await session.withTransaction(async () => {
        const [target, current] = await Promise.all([TrackerVersion.findOne({ trackerId, version }).session(session).lean(), Tracker.findById(trackerId).session(session)]);
        if (!target || !current) throw new ServiceError('missing-resource', 'TRACKER_VERSION_NOT_FOUND', 'Tracker version not found');
        await TrackerVersion.updateOne({ trackerId, version: current.version ?? 1 }, { $setOnInsert: { snapshot: current.toObject(), changedBy: actor.userId, reason: 'Snapshot before admin restore' } }, { upsert: true, session });
        const update: Record<string, unknown> = {};
        const snapshot = target.snapshot as Record<string, unknown>;
        for (const key of restorable) if (snapshot[key] !== undefined) update[key] = snapshot[key];
        current.set(update);
        current.version = Math.max(current.version ?? 1, version) + 1;
        await current.save({ session });
        await recordAdminAction(actor, 'tracker.version_restored', 'trackers', { trackerId, restoredVersion: version, newVersion: current.version, reason }, session);
        output = { trackerId, restoredVersion: version, newVersion: current.version, updatedAt: current.updatedAt };
      });
      if (!output) {
        throw new ServiceError(
          'internal',
          'TRACKER_VERSION_RESTORE_FAILED',
          'Tracker version restore did not produce a result'
        );
      }
      return output;
    } finally { await session.endSession(); }
  }
}
