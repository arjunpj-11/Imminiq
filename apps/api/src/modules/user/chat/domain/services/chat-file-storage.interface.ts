import type { StoredChatFile, UploadedChatFile } from '../chat.types';

export interface IChatFileStorage {
  upload(file: UploadedChatFile, userId: string): Promise<StoredChatFile>;
}
