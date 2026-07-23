import { Types } from 'mongoose';

import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import type {
  CloneFreshnessAnalysisClaim,
  ICloneFreshnessAnalysisRepository,
} from '../../domain/repositories/clone-freshness-analysis.repository.interface';

export class MongoCloneFreshnessAnalysisRepository implements ICloneFreshnessAnalysisRepository {
  async claim(input: { trackerId: string; userId: string }): Promise<CloneFreshnessAnalysisClaim> {
    if (!Types.ObjectId.isValid(input.trackerId) || !Types.ObjectId.isValid(input.userId)) {
      return { status: 'not_found' };
    }

    const ownershipQuery = {
      _id: input.trackerId,
      ownerId: input.userId,
      sourceTrackerId: { $exists: true, $ne: null },
      deletedAt: null,
    };

    const ownedClone = await Tracker.findOne(ownershipQuery)
      .select('_id sourceTrackerId cloneFreshnessAnalysisStatus')
      .lean();

    if (!ownedClone?.sourceTrackerId) {
      return { status: 'not_found' };
    }

    if (
      ownedClone.cloneFreshnessAnalysisStatus === 'pending' ||
      ownedClone.cloneFreshnessAnalysisStatus === 'completed'
    ) {
      return { status: 'already_used' };
    }

    const priorUse = await Tracker.exists({
      _id: { $ne: ownedClone._id },
      ownerId: input.userId,
      sourceTrackerId: ownedClone.sourceTrackerId,
      cloneFreshnessAnalysisStatus: { $in: ['pending', 'completed'] },
    });

    if (priorUse) {
      return { status: 'already_used' };
    }

    const claimed = await Tracker.findOneAndUpdate(
      {
        ...ownershipQuery,
        $or: [
          { cloneFreshnessAnalysisStatus: { $exists: false } },
          { cloneFreshnessAnalysisStatus: null },
          { cloneFreshnessAnalysisStatus: 'failed' },
        ],
      },
      { $set: { cloneFreshnessAnalysisStatus: 'pending' } },
      { new: true }
    )
      .select('sourceTrackerId')
      .lean();

    if (!claimed?.sourceTrackerId) return { status: 'already_used' };

    const source = await Tracker.findById(claimed.sourceTrackerId).select('createdAt').lean();
    if (!source?.createdAt) {
      await Tracker.updateOne(ownershipQuery, {
        $set: { cloneFreshnessAnalysisStatus: 'failed' },
      });
      return { status: 'not_found' };
    }

    return {
      status: 'claimed',
      sourceTrackerId: claimed.sourceTrackerId.toString(),
      sourceTrackerCreatedAt: source.createdAt,
    };
  }

  async attachJob(input: { trackerId: string; userId: string; jobId: string }): Promise<void> {
    await Tracker.updateOne(
      {
        _id: input.trackerId,
        ownerId: input.userId,
        cloneFreshnessAnalysisStatus: 'pending',
      },
      { $set: { cloneFreshnessAnalysisJobId: input.jobId } }
    );
  }

  async markFailed(input: { trackerId: string; userId: string }): Promise<void> {
    await Tracker.updateOne(
      { _id: input.trackerId, ownerId: input.userId },
      { $set: { cloneFreshnessAnalysisStatus: 'failed' } }
    );
  }
}

export const mongoCloneFreshnessAnalysisRepository = new MongoCloneFreshnessAnalysisRepository();
