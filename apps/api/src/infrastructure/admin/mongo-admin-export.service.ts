import { User } from '../database/models/user.model';
import { Tracker } from '../database/models/tracker.model';
import { MockTestModel } from '../database/models/mock-test.model';
import type { IAdminExportService } from '../../shared/admin/admin-export.service';

export const escapeAdminExportSearch = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const safeAdminCsvValue = (value: unknown) => {
  const text = String(value ?? '');
  const neutralized = /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${neutralized.replaceAll('"', '""')}"`;
};
const csv = (rows: unknown[][]) => rows.map((row) => row.map(safeAdminCsvValue).join(',')).join('\r\n');
const search = (value: string, fields: string[]) => value ? { $or: fields.map((field) => ({ [field]: { $regex: escapeAdminExportSearch(value), $options: 'i' } })) } : {};

export class AdminExportService implements IAdminExportService {
  async users(query: { search: string; status: string }) {
    const filter: Record<string, unknown> = { deletedAt: null, ...search(query.search, ['fullName', 'username', 'email', 'phone']) };
    if (query.status !== 'all') filter.status = query.status;
    const rows = await User.find(filter).sort({ createdAt: -1 }).limit(50_000).select('fullName username email phone role status emailVerified phoneVerified lastActiveAt createdAt').lean();
    return csv([['ID', 'Name', 'Username', 'Email', 'Phone', 'Role', 'Status', 'Created', 'Last active'], ...rows.map((row) => [row._id, row.fullName, row.username, row.email, row.phone, row.role, row.status, row.createdAt.toISOString(), row.lastActiveAt.toISOString()])]);
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
    return csv([['ID', 'Title', 'Owner', 'Owner email', 'Difficulty', 'Moderation', 'Questions', 'Time limit', 'Created', 'Updated'], ...rows.map((row) => { const owner = row.ownerId as unknown as { fullName?: string; email?: string }; return [row._id, row.title, owner?.fullName, owner?.email, row.difficulty, row.moderationStatus, row.questionCount, row.timeLimitMinutes, row.createdAt.toISOString(), row.updatedAt.toISOString()]; })]);
  }
}
