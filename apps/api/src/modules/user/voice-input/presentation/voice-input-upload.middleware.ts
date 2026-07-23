import { extname } from 'node:path';
import multer from 'multer';

import { ApiError } from '../../../../shared/utils/api-error';

const allowedAudio = new Map<string, Set<string>>([
  ['audio/webm', new Set(['.webm'])],
  ['audio/ogg', new Set(['.ogg', '.oga'])],
  ['audio/mpeg', new Set(['.mp3', '.mpeg'])],
  ['audio/mp4', new Set(['.m4a', '.mp4'])],
  ['audio/wav', new Set(['.wav'])],
  ['audio/x-wav', new Set(['.wav'])],
]);

export const voiceInputUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!allowedAudio.get(file.mimetype)?.has(extname(file.originalname).toLowerCase())) {
      callback(
        new ApiError(
          400,
          'Upload a WEBM, OGG, MP3, M4A, MP4, or WAV voice recording',
          'INVALID_VOICE_INPUT_FILE'
        )
      );
      return;
    }
    callback(null, true);
  },
});
