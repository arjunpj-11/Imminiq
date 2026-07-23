import { Readable } from 'node:stream';

import { cloudinary } from '../../../../../infrastructure/storage/cloudinary.client';
import { ChatDomainError } from '../../domain/chat-domain.error';
import type {
  StoredChatFile,
  UploadedChatFile,
} from '../../domain/chat.types';
import type { IChatFileStorage } from '../../domain/services/chat-file-storage.interface';

export class CloudinaryChatFileStorageGateway implements IChatFileStorage {
  async upload(file: UploadedChatFile, userId: string): Promise<StoredChatFile> {
    return new Promise((resolve, reject) => {
      const resourceType = file.mimetype.startsWith('image/')
        ? 'image'
        : file.mimetype.startsWith('audio/')
          ? 'video'
          : 'raw';
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `imminiq/chat/${userId}`,
          resource_type: resourceType,
          overwrite: false,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) {
            reject(new ChatDomainError('CHAT_UPLOAD_FAILED', 'The attachment could not be uploaded'));
            return;
          }
          resolve({
            url: result.secure_url,
            ...(result.public_id ? { storagePublicId: result.public_id } : {}),
            name: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
          });
        }
      );
      stream.on('error', () => {
        reject(new ChatDomainError('CHAT_UPLOAD_FAILED', 'The attachment could not be uploaded'));
      });
      Readable.from(file.buffer).pipe(stream);
    });
  }
}

export const cloudinaryChatFileStorageGateway = new CloudinaryChatFileStorageGateway();
