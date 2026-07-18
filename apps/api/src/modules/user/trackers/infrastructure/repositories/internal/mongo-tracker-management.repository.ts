import { CommunityVerificationSubmission } from '../../../../../../infrastructure/database/models/community-verification-submission.model';
import { Tracker } from '../../../../../../infrastructure/database/models/tracker.model';
import { TrackerProgress } from '../../../../../../infrastructure/database/models/tracker-progress.model';
import { User } from '../../../../../../infrastructure/database/models/user.model';
import { TrackerReport } from '../../../../../../infrastructure/database/models/tracker-report.model';
import { TrackerVersion } from '../../../../../../infrastructure/database/models/tracker-version.model';
import { TrackerClan } from '../../../../../../infrastructure/database/models/tracker-clan.model';
import { TrackerTopicContribution } from '../../../../../../infrastructure/database/models/tracker-topic-contribution.model';
import type {
  ArchiveOwnedTrackerInput,
  FindOwnedTrackerByIdInput,
  RestoreOwnedTrackerInput,
  SoftDeleteOwnedTrackerInput,
  UnpublishOwnedTrackerInput,
} from '../../../domain/repositories/tracker.repository.interface';
import type {
  CreateTrackerInput,
  PublishTrackerInput,
  TrackerListFilter,
  TrackerRecord,
  UpdateTrackerInput,
} from '../../../domain/trackers.types';
import { MongoTrackerBaseRepository } from '../shared/mongo-tracker-base.repository';
import { MongoTrackerErrorMapper } from '../shared/mongo-tracker-error.mapper';
import { MongoTrackerMapper } from '../shared/mongo-tracker.mapper';
import type { MongoQuery, MongoUpdate } from '../shared/mongo-tracker.types';

export class MongoTrackerManagementRepository extends MongoTrackerBaseRepository {
  constructor(protected readonly mapper = new MongoTrackerMapper()) {
    super();
  }

  async findReportableTrackerById(trackerId: string) {
    return this.execute('TRACKER_READ_FAILED', 'Failed to read tracker', async () => {
      const tracker = await Tracker.findOne({
        _id: this.mapper.toObjectId(trackerId),
        deletedAt: null,
        visibility: 'public',
        publishedAt: { $ne: null },
        moderationStatus: { $in: ['active', null] },
      }).lean();
      return tracker ? this.mapper.toDomainRecord<TrackerRecord>(tracker) : null;
    });
  }

  async createOrReopenTrackerReport(input: {
    trackerId: string;
    reporterId: string;
    reason: string;
    details: string;
  }) {
    return this.execute('TRACKER_REPORT_WRITE_FAILED', 'Failed to report tracker', async () => {
      const now = new Date();
      const report = await TrackerReport.findOneAndUpdate(
        {
          trackerId: this.mapper.toObjectId(input.trackerId),
          reporterId: this.mapper.toObjectId(input.reporterId),
        },
        {
          $set: {
            reason: input.reason,
            details: input.details,
            status: 'open',
            assignedTo: null,
            resolutionAction: 'none',
            resolutionNote: '',
            resolvedBy: null,
            resolvedAt: null,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      ).lean();
      return {
        id: String(report!._id),
        status: String(report!.status),
        createdAt: report!.createdAt,
        updatedAt: report!.updatedAt,
      };
    });
  }

  async listDomains(search: string, limit: number) {
    return this.execute(
      'TRACKER_DOMAINS_READ_FAILED',
      'Failed to read tracker domains',
      async () => {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rows = await Tracker.aggregate<{ _id: string; label: string; count: number }>([
          {
            $match: {
              deletedAt: null,
              moderationStatus: { $in: ['active', null] },
              category: {
                $type: 'string',
                $ne: '',
                ...(escapedSearch ? { $regex: escapedSearch, $options: 'i' } : {}),
              },
            },
          },
          {
            $project: {
              normalized: { $toLower: { $trim: { input: '$category' } } },
              label: { $trim: { input: '$category' } },
            },
          },
          { $match: { normalized: { $ne: '' } } },
          {
            $group: {
              _id: '$normalized',
              label: { $first: '$label' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1, label: 1 } },
          { $limit: limit },
        ]);

        return rows.map((row) => row.label);
      }
    );
  }

  async hasAnyTrackerForUser(userId: string) {
    return this.execute('TRACKER_READ_FAILED', 'Failed to check user trackers', async () => {
      const tracker = await Tracker.exists(
        this.mapper.asMongoFilter({
          ownerId: this.mapper.toObjectId(userId),
          deletedAt: null,
        })
      );

      return Boolean(tracker);
    });
  }

  async getTrackerSummary(userId: string) {
    return this.execute(
      'TRACKER_SUMMARY_READ_FAILED',
      'Failed to read tracker summary',
      async () => {
        const ownerId = this.mapper.toObjectId(userId);
        const base: MongoQuery = {
          ownerId,
          deletedAt: null,
        };

        const [total, active, completed, published, progressAgg] = await Promise.all([
          Tracker.countDocuments(this.mapper.asMongoFilter(base)),
          Tracker.countDocuments(
            this.mapper.asMongoFilter({
              ...base,
              status: 'active',
            })
          ),
          Tracker.countDocuments(
            this.mapper.asMongoFilter({
              ...base,
              status: 'completed',
            })
          ),
          Tracker.countDocuments(
            this.mapper.asMongoFilter({
              ...base,
              visibility: 'public',
              publishedAt: {
                $ne: null,
              },
            })
          ),
          Tracker.aggregate<{ avg?: number }>([
            {
              $match: base,
            },
            {
              $group: {
                _id: null,
                avg: {
                  $avg: '$progressPercent',
                },
              },
            },
          ]),
        ]);

        return {
          totalTrackers: total,
          activeTrackers: active,
          completedTrackers: completed,
          publishedTrackers: published,
          averageProgress: Math.round(progressAgg[0]?.avg || 0),
        };
      }
    );
  }

  async listOwnedTrackers(filter: TrackerListFilter) {
    return this.execute('TRACKER_LIST_READ_FAILED', 'Failed to read owned trackers', async () => {
      const { userId, status = 'all', domain = 'all', sortBy = 'lastActive', page, limit } = filter;

      const userObjId = this.mapper.toObjectId(userId);
      const clans = await TrackerClan.find({
        members: { $elemMatch: { userId: userObjId, role: 'co_owner' } },
      })
        .select('trackerId')
        .lean<Array<{ trackerId: unknown }>>();
      const managedTrackerIds = clans.map((clan) => clan.trackerId);
      const ownedOriginals = await Tracker.find({
        ownerId: userObjId,
        sourceTrackerId: null,
        deletedAt: null,
      })
        .select('_id')
        .lean<Array<{ _id: unknown }>>();
      const sharedOriginalIds = [
        ...managedTrackerIds,
        ...ownedOriginals.map((tracker) => tracker._id),
      ];

      const query = {
        $or: [{ ownerId: userObjId }, { _id: { $in: managedTrackerIds } }],
        ...(sharedOriginalIds.length
          ? { sourceTrackerId: { $nin: sharedOriginalIds } }
          : {}),
        deletedAt: null,
      } as unknown as MongoQuery;

      if (status !== 'all') {
        query.status = status;
      }

      if (domain !== 'all') {
        query.domain = domain;
      }

      const skip = (page - 1) * limit;

      const [trackers, total] = await Promise.all([
        Tracker.find(this.mapper.asMongoFilter(query))
          .sort(this.mapper.buildTrackerSort(sortBy))
          .skip(skip)
          .limit(limit)
          .lean(),
        Tracker.countDocuments(this.mapper.asMongoFilter(query)),
      ]);

      const trackerIds = trackers.map((tracker) => tracker._id);
      const sourceTrackerIds = trackers
        .map((tracker) => tracker.sourceTrackerId)
        .filter((sourceTrackerId): sourceTrackerId is NonNullable<typeof sourceTrackerId> =>
          Boolean(sourceTrackerId)
        );

      const [sourceTrackers, sourceClans] = await Promise.all([
        Tracker.find({ _id: { $in: sourceTrackerIds }, deletedAt: null })
          .select('_id ownerId')
          .lean<Array<{ _id: unknown; ownerId: unknown }>>(),
        TrackerClan.find({
          trackerId: { $in: sourceTrackerIds },
          'members.userId': userObjId,
        })
          .select('trackerId members roleInvitations')
          .lean<
            Array<{
              trackerId: unknown;
              members: Array<{ userId: unknown; role: 'co_owner' | 'member' }>;
              roleInvitations?: Array<{
                userId: unknown;
                status: 'pending' | 'accepted' | 'declined';
              }>;
            }>
          >(),
      ]);
      const sourceOwnerMap = new Map(
        sourceTrackers.map((sourceTracker) => [String(sourceTracker._id), String(sourceTracker.ownerId)])
      );
      const sourceClanRoleMap = new Map(
        sourceClans.flatMap((clan) => {
          const membership = clan.members.find((member) => String(member.userId) === userId);
          return membership ? [[String(clan.trackerId), membership.role] as const] : [];
        })
      );
      const pendingRoleInvitationSourceIds = new Set(
        sourceClans.flatMap((clan) =>
          clan.roleInvitations?.some(
            (invitation) =>
              String(invitation.userId) === userId && invitation.status === 'pending'
          )
            ? [String(clan.trackerId)]
            : []
        )
      );

      const pendingContributionCounts = await TrackerTopicContribution.aggregate<{
        _id: unknown;
        count: number;
      }>([
        {
          $match: {
            sourceTrackerId: { $in: trackerIds },
            status: 'pending',
          },
        },
        { $group: { _id: '$sourceTrackerId', count: { $sum: 1 } } },
      ]);
      const pendingContributionMap = new Map(
        pendingContributionCounts.map((row) => [String(row._id), row.count])
      );

      const progressList = await TrackerProgress.find(
        this.mapper.asMongoFilter({
          userId: userObjId,
          trackerId: {
            $in: trackerIds,
          },
          deletedAt: null,
        })
      )
        .select('trackerId completedTopics totalTopics completionPercentage lastStudiedAt')
        .lean();

      const progressMap = new Map(
        progressList.map((progress) => [progress.trackerId.toString(), progress])
      );

      const enrichedTrackers = trackers.map((tracker) => {
        const progress = progressMap.get(tracker._id.toString());

        return {
          ...tracker,

          completedTopics: progress?.completedTopics ?? 0,

          totalTopics: progress?.totalTopics ?? tracker.topicsCount ?? 0,

          progressPercent: progress?.completionPercentage ?? tracker.progressPercent ?? 0,

          lastActiveAt:
            progress?.lastStudiedAt ??
            tracker.lastActiveAt ??
            tracker.updatedAt ??
            tracker.createdAt,
          clanRole: tracker.sourceTrackerId
            ? sourceOwnerMap.get(String(tracker.sourceTrackerId)) === userId
              ? ('owner' as const)
              : sourceClanRoleMap.get(String(tracker.sourceTrackerId))
            : String(tracker.ownerId) === userId
              ? ('owner' as const)
              : ('co_owner' as const),
          clanNotificationsCount:
            (pendingContributionMap.get(tracker._id.toString()) ?? 0) +
            (tracker.sourceTrackerId &&
            pendingRoleInvitationSourceIds.has(String(tracker.sourceTrackerId))
              ? 1
              : 0),
        };
      });

      const trackersWithSources = await this.enrichCloneSources(
        enrichedTrackers as unknown as TrackerRecord[]
      );

      return {
        trackers: trackersWithSources,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  async createTracker(data: CreateTrackerInput) {
    return this.execute(
      'TRACKER_CREATE_FAILED',
      'Failed to create tracker',
      async () => {
        const tracker = await Tracker.create(
          this.mapper.asMongoCreatePayload({
            ownerId: this.mapper.toObjectId(data.userId),
            title: data.title,
            description: data.description || '',
            domain: data.domain || 'other',
            goal: data.goal || '',
            level: data.level || 'beginner',
            status: 'active',
            visibility: data.visibility || 'private',
            progressPercent: 0,
            topicsCount: 0,
            subtopicsCount: 0,
            completedSubtopicsCount: 0,
            lastActiveAt: new Date(),
            publishedAt: null,
            completedAt: null,
            deletedAt: null,
          })
        );

        return tracker as TrackerRecord;
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError
    );
  }

  async updateOwnedTracker(data: UpdateTrackerInput) {
    return this.execute(
      'TRACKER_UPDATE_FAILED',
      'Failed to update owned tracker',
      async () => {
        const trackerId = this.mapper.toObjectId(data.trackerId);
        const userId = this.mapper.toObjectId(data.userId);
        const coOwner = await TrackerClan.exists({
          trackerId,
          members: { $elemMatch: { userId, role: 'co_owner' } },
        });
        const current = await Tracker.findOne({
          _id: trackerId,
          ...(coOwner ? {} : { ownerId: userId }),
          deletedAt: null,
          moderationStatus: { $in: ['active', null] },
        }).lean();
        if (!current) return null;
        await TrackerVersion.updateOne(
          { trackerId: current._id, version: current.version ?? 1 },
          {
            $setOnInsert: {
              snapshot: current,
              changedBy: userId,
              reason: coOwner ? 'Co-owner edited tracker metadata' : 'Owner edited tracker metadata',
            },
          },
          { upsert: true }
        );
        const update: MongoUpdate = {};

        if (data.title !== undefined) {
          update.title = data.title;
        }

        if (data.description !== undefined) {
          update.description = data.description;
        }

        if (data.domain !== undefined) {
          update.domain = data.domain;
        }

        if (data.goal !== undefined) {
          update.goal = data.goal;
        }

        if (data.level !== undefined) {
          update.level = data.level;
        }

        const tracker = await Tracker.findOneAndUpdate(
          this.mapper.asMongoFilter({
            _id: trackerId,
            ...(coOwner ? {} : { ownerId: userId }),
            deletedAt: null,
            moderationStatus: { $in: ['active', null] },
          }),
          this.mapper.asMongoUpdate({
            $set: update,
            $inc: { version: 1 },
          }),
          {
            returnDocument: 'after',
          }
        );

        return tracker as TrackerRecord | null;
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError
    );
  }

  async softDeleteOwnedTracker(data: SoftDeleteOwnedTrackerInput) {
    return this.execute('TRACKER_DELETE_FAILED', 'Failed to delete owned tracker', async () => {
      const deletedAt = new Date();
      const tracker = await Tracker.findOneAndUpdate(
        this.mapper.asMongoFilter({
          _id: this.mapper.toObjectId(data.trackerId),
          ownerId: this.mapper.toObjectId(data.userId),
          deletedAt: null,
          moderationStatus: { $in: ['active', null] },
        }),
        this.mapper.asMongoUpdate({
          $set: {
            deletedAt,
            visibility: 'private',
            publishedAt: null,
            verificationStatus: null,
          },
        }),
        {
          returnDocument: 'after',
        }
      );

      if (tracker) {
        await CommunityVerificationSubmission.updateMany(
          {
            trackerId: tracker._id,
            deletedAt: null,
          },
          {
            $set: {
              status: 'closed',
              deletedAt,
            },
          }
        );
      }

      return tracker as TrackerRecord | null;
    });
  }

  async findOwnedTrackerById(data: FindOwnedTrackerByIdInput) {
    return this.execute('TRACKER_READ_FAILED', 'Failed to read owned tracker', async () => {
      const trackerId = this.mapper.toObjectId(data.trackerId);
      const userId = this.mapper.toObjectId(data.userId);
      const coOwner = await TrackerClan.exists({
        trackerId,
        members: { $elemMatch: { userId, role: 'co_owner' } },
      });
      const tracker = await Tracker.findOne(
        this.mapper.asMongoFilter({
          _id: trackerId,
          ...(coOwner ? {} : { ownerId: userId }),
          deletedAt: null,
          moderationStatus: { $in: ['active', null] },
        })
      ).lean();

      if (!tracker) return null;
      const [trackerWithSource] = await this.enrichCloneSources([
        tracker as unknown as TrackerRecord,
      ]);
      return trackerWithSource ?? null;
    });
  }

  async archiveOwnedTracker(data: ArchiveOwnedTrackerInput) {
    return this.execute('TRACKER_ARCHIVE_FAILED', 'Failed to archive tracker', async () => {
      const tracker = await Tracker.findOneAndUpdate(
        this.mapper.asMongoFilter({
          _id: this.mapper.toObjectId(data.trackerId),
          ownerId: this.mapper.toObjectId(data.userId),
          deletedAt: null,
          moderationStatus: { $in: ['active', null] },
        }),
        this.mapper.asMongoUpdate({
          $set: {
            status: 'archived',
          },
        }),
        {
          returnDocument: 'after',
        }
      );

      return tracker as TrackerRecord | null;
    });
  }

  async restoreOwnedTracker(data: RestoreOwnedTrackerInput) {
    return this.execute('TRACKER_RESTORE_FAILED', 'Failed to restore tracker', async () => {
      const tracker = await Tracker.findOneAndUpdate(
        this.mapper.asMongoFilter({
          _id: this.mapper.toObjectId(data.trackerId),
          ownerId: this.mapper.toObjectId(data.userId),
          deletedAt: null,
          moderationStatus: { $in: ['active', null] },
        }),
        this.mapper.asMongoUpdate({
          $set: {
            status: 'active',
          },
        }),
        {
          returnDocument: 'after',
        }
      );

      return tracker as TrackerRecord | null;
    });
  }

  async publishOwnedTracker(data: PublishTrackerInput) {
    return this.execute(
      'TRACKER_PUBLISH_FAILED',
      'Failed to publish tracker',
      async () => {
        const update: MongoUpdate = {
          visibility: 'public',
          publishedAt: new Date(),
        };

        if (typeof data.name === 'string' && data.name.trim()) {
          update.title = data.name.trim();
        }

        if (typeof data.description === 'string') {
          update.description = data.description.trim();
        }

        // Input uses `domain`, but MongoDB tracker field is `category`
        if (typeof data.domain === 'string' && data.domain.trim()) {
          update.category = data.domain.trim();
        }

        if (
          data.difficulty === 'beginner' ||
          data.difficulty === 'intermediate' ||
          data.difficulty === 'advanced'
        ) {
          update.level = data.difficulty;
        }

        if (Array.isArray(data.tags)) {
          update.tags = data.tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
        }

        if (typeof data.allowClone === 'boolean') {
          update.allowClone = data.allowClone;
        }

        const tracker = await Tracker.findOneAndUpdate(
          this.mapper.asMongoFilter({
            _id: this.mapper.toObjectId(data.trackerId),
            ownerId: this.mapper.toObjectId(data.userId),
            deletedAt: null,
            moderationStatus: { $in: ['active', null] },
          }),
          this.mapper.asMongoUpdate({
            $set: update,
          }),
          {
            returnDocument: 'after',
          }
        );

        return tracker as TrackerRecord | null;
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError
    );
  }

  async unpublishOwnedTracker(data: UnpublishOwnedTrackerInput) {
    return this.execute('TRACKER_UNPUBLISH_FAILED', 'Failed to unpublish tracker', async () => {
      const tracker = await Tracker.findOneAndUpdate(
        this.mapper.asMongoFilter({
          _id: this.mapper.toObjectId(data.trackerId),
          ownerId: this.mapper.toObjectId(data.userId),
          deletedAt: null,
          moderationStatus: { $in: ['active', null] },
        }),
        this.mapper.asMongoUpdate({
          $set: {
            visibility: 'private',
            publishedAt: null,
          },
        }),
        {
          returnDocument: 'after',
        }
      );

      return tracker as TrackerRecord | null;
    });
  }

  private async enrichCloneSources(trackers: TrackerRecord[]): Promise<TrackerRecord[]> {
    const sourceIds = [
      ...new Set(
        trackers
          .map((tracker) => tracker.sourceTrackerId)
          .filter((value): value is string => Boolean(value))
          .map(String)
      ),
    ];

    if (sourceIds.length === 0) return trackers;

    const sourceTrackers = await Tracker.find({ _id: { $in: sourceIds } })
      .select('_id ownerId')
      .lean<Array<{ _id: unknown; ownerId: unknown }>>();
    const ownerIds = [...new Set(sourceTrackers.map((source) => String(source.ownerId)))];
    const owners = await User.find({ _id: { $in: ownerIds }, deletedAt: null })
      .select('_id fullName username avatarUrl')
      .lean<Array<{
        _id: unknown;
        fullName?: string;
        username?: string;
        avatarUrl?: string | null;
      }>>();
    const ownerMap = new Map(owners.map((owner) => [String(owner._id), owner]));
    const sourceMap = new Map(sourceTrackers.map((source) => [String(source._id), source]));

    return trackers.map((tracker) => {
      const sourceTrackerId = tracker.sourceTrackerId ? String(tracker.sourceTrackerId) : null;
      if (!sourceTrackerId) return { ...tracker, sourceTrackerId: null, clonedFrom: null };

      const source = sourceMap.get(sourceTrackerId);
      const owner = source ? ownerMap.get(String(source.ownerId)) : undefined;
      if (!source || !owner?.username) return { ...tracker, sourceTrackerId, clonedFrom: null };

      return {
        ...tracker,
        sourceTrackerId,
        clonedFrom: {
          trackerId: sourceTrackerId,
          ownerId: String(source.ownerId),
          name: owner.fullName?.trim() || owner.username,
          username: owner.username,
          avatarUrl: owner.avatarUrl ?? null,
        },
      };
    });
  }
}

export const mongoTrackerManagementRepository = new MongoTrackerManagementRepository();
