import { Tracker } from '../../../../../infrastructure/database/models/tracker.model'
import { TrackerTopic } from '../../../../../infrastructure/database/models/tracker-topic.model'
import { TrackerSubtopic } from '../../../../../infrastructure/database/models/tracker-subtopic.model'
import { TrackerLesson } from '../../../../../infrastructure/database/models/tracker-lesson.model'
import { ApiError } from '../../../../../shared/utils/ApiError'
import { recordAdminAction } from '../../../shared'
import { createAdminPage, escapeAdminSearch } from '../../../shared'
import type { AdminActor, AdminListQuery } from '../../../shared'
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface'
export class MongoAdminTrackersRepository implements IAdminTrackersRepository {
  async list(query: AdminListQuery) {
    const filter: Record<string, unknown> = { deletedAt: null }
    if (query.status && query.status !== 'all') filter.status = query.status
    if (query.search) filter.$or = [{ title: new RegExp(escapeAdminSearch(query.search), 'i') }, { category: new RegExp(escapeAdminSearch(query.search), 'i') }]
    const [rows, total, active, draft, archived] = await Promise.all([
      Tracker.find(filter).sort({ createdAt: -1 }).skip((query.page - 1) * query.limit).limit(query.limit).populate('ownerId', 'fullName username').lean(),
      Tracker.countDocuments(filter), Tracker.countDocuments({ deletedAt: null, status: 'active' }), Tracker.countDocuments({ deletedAt: null, status: 'draft' }), Tracker.countDocuments({ deletedAt: null, status: 'archived' }),
    ])
    const items = rows.map((row) => { const owner = row.ownerId as unknown as { fullName?: string; username?: string }; return { id: String(row._id), title: row.title, owner: owner?.fullName ?? owner?.username ?? 'Unknown', category: row.category, level: row.level, visibility: row.visibility, status: row.status, verificationStatus: row.verificationStatus ?? null, topicsCount: row.topicsCount, cloneCount: row.cloneCount, createdAt: row.createdAt } })
    return createAdminPage(items, query, total, { active, draft, archived })
  }
  async getDetail(id: string) {
    const tracker = await Tracker.findOne({ _id: id, deletedAt: null }).populate('ownerId', 'fullName username email').lean()
    if (!tracker) return null
    const [topics, subtopics] = await Promise.all([TrackerTopic.find({ trackerId: id, deletedAt: null }).sort({ order: 1 }).lean(), TrackerSubtopic.find({ trackerId: id, deletedAt: null }).sort({ topicId: 1, order: 1 }).lean()])
    const owner = tracker.ownerId as unknown as { _id?: unknown; fullName?: string; username?: string; email?: string }
    return { id: String(tracker._id), title: tracker.title, description: tracker.description, owner: owner?.fullName ?? owner?.username ?? 'Unknown', ownerId: String(owner?._id ?? ''), ...(owner?.email ? { ownerEmail: owner.email } : {}), category: tracker.category, level: tracker.level, visibility: tracker.visibility, status: tracker.status, verificationStatus: tracker.verificationStatus ?? null, topicsCount: tracker.topicsCount, cloneCount: tracker.cloneCount, createdAt: tracker.createdAt, topics: topics.map((topic) => ({ id: String(topic._id), title: topic.title, description: topic.description, order: topic.order, status: topic.status, estimatedHours: topic.estimatedHours, subtopics: subtopics.filter((subtopic) => String(subtopic.topicId) === String(topic._id)).map((subtopic) => ({ id: String(subtopic._id), title: subtopic.title, description: subtopic.description, order: subtopic.order, depth: subtopic.depth, parentSubtopicId: subtopic.parentSubtopicId ? String(subtopic.parentSubtopicId) : null, estimatedMinutes: subtopic.estimatedMinutes })) })) }
  }
  async delete(id: string, actor: AdminActor) {
    const tracker = await Tracker.findOne({ _id: id, deletedAt: null }).populate('ownerId', 'fullName username email').lean()
    if (!tracker) throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    const deletedAt = new Date()
    await Promise.all([Tracker.updateOne({ _id: id }, { $set: { deletedAt, status: 'archived' } }), TrackerTopic.updateMany({ trackerId: id, deletedAt: null }, { $set: { deletedAt } }), TrackerSubtopic.updateMany({ trackerId: id, deletedAt: null }, { $set: { deletedAt } }), TrackerLesson.updateMany({ trackerId: id, deletedAt: null }, { $set: { deletedAt } })])
    const owner = tracker.ownerId as unknown as { _id?: unknown; fullName?: string; username?: string; email?: string }
    await recordAdminAction(actor, 'admin_tracker_deleted', 'admin.trackers', { targetType: 'tracker', targetId: id, targetTitle: tracker.title, ownerId: String(owner?._id ?? ''), ownerName: owner?.fullName ?? owner?.username ?? 'Unknown', ownerEmail: owner?.email ?? '', changes: { deletedAt, status: 'archived' } })
    return { id, title: tracker.title, ...(owner?.email ? { ownerEmail: owner.email } : {}), deletedAt }
  }
}
export const mongoAdminTrackersRepository = new MongoAdminTrackersRepository()
