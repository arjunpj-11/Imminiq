import { AdminUserNote } from '../../../../../infrastructure/database/models/admin-user-note.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import { ServiceError } from '../../../../../shared/errors/service.error';
import type { AdminActor } from '../../../../../shared/admin';
import { recordAdminAction } from '../../../../../infrastructure/admin';

export interface IAdminUserNotesService {
  list(userId: string): Promise<object>;
  add(userId: string, input: { note: string; tags: string[] }, actor: AdminActor): Promise<object>;
  remove(userId: string, noteId: string, actor: AdminActor): Promise<object>;
  updateTags(userId: string, tags: string[], actor: AdminActor): Promise<object>;
}
export class AdminUserNotesService implements IAdminUserNotesService {
  async list(userId: string) {
    const [notes, user] = await Promise.all([
      AdminUserNote.find({ userId, deletedAt: null }).populate('authorId', 'fullName username').sort({ createdAt: -1 }).lean(),
      User.findById(userId).select('adminTags').lean() as Promise<{ adminTags?: string[] } | null>,
    ]);
    return { tags: user?.adminTags ?? [], notes: notes.map((row) => { const author = row.authorId as unknown as { fullName?: string; username?: string }; return { id: String(row._id), note: row.note, tags: row.tags, author: author?.fullName ?? author?.username ?? 'Admin', createdAt: row.createdAt }; }) };
  }
  async add(userId: string, input: { note: string; tags: string[] }, actor: AdminActor) {
    if (!await User.exists({ _id: userId, deletedAt: null })) throw new ServiceError('missing-resource', 'USER_NOT_FOUND', 'User not found');
    const row = await AdminUserNote.create({ userId, authorId: actor.userId, note: input.note, tags: input.tags });
    await recordAdminAction(actor, 'user_note.created', 'users', { userId, noteId: String(row._id), tags: input.tags });
    return { id: String(row._id), note: row.note, tags: row.tags, createdAt: row.createdAt };
  }
  async remove(userId: string, noteId: string, actor: AdminActor) {
    const row = await AdminUserNote.findOneAndUpdate({ _id: noteId, userId, deletedAt: null }, { $set: { deletedAt: new Date() } }, { new: true });
    if (!row) throw new ServiceError('missing-resource', 'USER_NOTE_NOT_FOUND', 'User note not found');
    await recordAdminAction(actor, 'user_note.deleted', 'users', { userId, noteId });
    return { id: noteId, deleted: true };
  }
  async updateTags(userId: string, tags: string[], actor: AdminActor) {
    const user = await User.findByIdAndUpdate(userId, { $set: { adminTags: tags } }, { new: true }).select('adminTags').lean() as { adminTags?: string[] } | null;
    if (!user) throw new ServiceError('missing-resource', 'USER_NOT_FOUND', 'User not found');
    await recordAdminAction(actor, 'user_tags.updated', 'users', { userId, tags });
    return { userId, tags: user.adminTags ?? [] };
  }
}
