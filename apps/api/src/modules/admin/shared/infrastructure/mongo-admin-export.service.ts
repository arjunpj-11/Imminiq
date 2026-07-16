import { User } from '../../../../infrastructure/database/models/user.model';
import { Tracker } from '../../../../infrastructure/database/models/tracker.model';
import { MockTestModel } from '../../../../infrastructure/database/models/mock-test.model';

const csv = (rows: unknown[][]) => rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
const search = (value: string, fields: string[]) => value ? { $or: fields.map((field) => ({ [field]: { $regex: value, $options: 'i' } })) } : {};

export interface IAdminExportService {
  users(query: { search: string; status: string }): Promise<string>;
  trackers(query: { search: string; status: string }): Promise<string>;
  mockTests(query: { search: string; status: string }): Promise<string>;
}

export class AdminExportService implements IAdminExportService {
  async users(query: { search: string; status: string }) {
    const filter: Record<string, unknown> = { deletedAt: null, ...search(query.search, ['fullName', 'username', 'email', 'phone']) };
    if (query.status === 'unverified') { filter.emailVerified = { $ne: true }; filter.phoneVerified = { $ne: true }; }
    else if (query.status !== 'all') filter.status = query.status;
    const rows = await User.find(filter).sort({ createdAt: -1 }).limit(50_000).select('fullName username email phone role status emailVerified phoneVerified lastActiveAt createdAt').lean();
    return csv([['ID', 'Name', 'Username', 'Email', 'Phone', 'Role', 'Status', 'Verified', 'Created', 'Last active'], ...rows.map((row) => [row._id, row.fullName, row.username, row.email, row.phone, row.role, row.status, row.emailVerified || row.phoneVerified, row.createdAt.toISOString(), row.lastActiveAt.toISOString()])]);
  }
  async trackers(query: { search: string; status: string }) {
    const filter: Record<string, unknown> = { ...search(query.search, ['title', 'description', 'tags']) };
    if (['suspended', 'deleted'].includes(query.status)) filter.moderationStatus = query.status;
    else if (query.status !== 'all') filter.status = query.status;
    const rows = await Tracker.find(filter).populate('ownerId', 'fullName username email').sort({ createdAt: -1 }).limit(50_000).lean();
    return csv([['ID', 'Title', 'Owner', 'Owner email', 'Status', 'Moderation', 'Visibility', 'Topics', 'Subtopics', 'Created', 'Updated'], ...rows.map((row) => { const owner = row.ownerId as unknown as { fullName?: string; email?: string }; return [row._id, row.title, owner?.fullName, owner?.email, row.status, row.moderationStatus, row.visibility, row.topicsCount, row.subtopicsCount, row.createdAt.toISOString(), row.updatedAt.toISOString()]; })]);
  }
  async mockTests(query: { search: string; status: string }) {
    const filter: Record<string, unknown> = { ...search(query.search, ['title', 'description', 'tags']) };
    if (query.status !== 'all') filter.moderationStatus = query.status;
    const rows = await MockTestModel.find(filter).populate('ownerId', 'fullName username email').sort({ createdAt: -1 }).limit(50_000).lean();
    return csv([['ID', 'Title', 'Owner', 'Owner email', 'Difficulty', 'Visibility', 'Moderation', 'Questions', 'Time limit', 'Created', 'Updated'], ...rows.map((row) => { const owner = row.ownerId as unknown as { fullName?: string; email?: string }; return [row._id, row.title, owner?.fullName, owner?.email, row.difficulty, row.visibility, row.moderationStatus, row.questionCount, row.timeLimitMinutes, row.createdAt.toISOString(), row.updatedAt.toISOString()]; })]);
  }
}
