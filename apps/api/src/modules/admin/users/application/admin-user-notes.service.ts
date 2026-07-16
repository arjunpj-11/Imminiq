import type { AdminActor } from '../../shared/domain';
export interface IAdminUserNotesService {
  list(userId: string): Promise<object>;
  add(userId: string, input: { note: string; tags: string[] }, actor: AdminActor): Promise<object>;
  remove(userId: string, noteId: string, actor: AdminActor): Promise<object>;
  updateTags(userId: string, tags: string[], actor: AdminActor): Promise<object>;
}
