import type { AdminActor } from '../../../../shared/admin';

export type AdminUserNoteInput = { note: string; tags: string[] };
export type AdminUserNoteDTO = {
  id: string;
  note: string;
  tags: string[];
  createdAt: Date;
};
export type AdminUserNoteListItemDTO = AdminUserNoteDTO & { author: string };
export type AdminUserNotesResultDTO = { tags: string[]; notes: AdminUserNoteListItemDTO[] };
export type DeleteAdminUserNoteResultDTO = { id: string; deleted: true };
export type UpdateAdminUserTagsResultDTO = { userId: string; tags: string[] };

export interface IAdminUserNotesService {
  list(userId: string): Promise<AdminUserNotesResultDTO>;
  add(userId: string, input: AdminUserNoteInput, actor: AdminActor): Promise<AdminUserNoteDTO>;
  remove(userId: string, noteId: string, actor: AdminActor): Promise<DeleteAdminUserNoteResultDTO>;
  updateTags(
    userId: string,
    tags: string[],
    actor: AdminActor
  ): Promise<UpdateAdminUserTagsResultDTO>;
}
