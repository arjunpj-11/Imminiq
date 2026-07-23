import { basename, extname } from 'node:path';
import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../../../../shared/utils/api-error';
import { validateUploadedImageSignature } from '../../../../shared/middlewares/image-upload-signature.middleware';

const MAX_CHAT_FILE_SIZE = 10 * 1024 * 1024;
const allowedFiles = new Map<string, Set<string>>([
  ['image/jpeg', new Set(['.jpg', '.jpeg'])],
  ['image/png', new Set(['.png'])],
  ['image/webp', new Set(['.webp'])],
  ['application/pdf', new Set(['.pdf'])],
  ['text/plain', new Set(['.txt', '.md'])],
  ['text/csv', new Set(['.csv'])],
  ['application/zip', new Set(['.zip'])],
  ['audio/webm', new Set(['.webm'])],
  ['audio/ogg', new Set(['.ogg', '.oga'])],
  ['audio/mpeg', new Set(['.mp3', '.mpeg'])],
  ['audio/mp4', new Set(['.m4a', '.mp4'])],
  ['audio/wav', new Set(['.wav'])],
  ['audio/x-wav', new Set(['.wav'])],
]);

export const chatFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CHAT_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();
    if (!allowedFiles.get(file.mimetype)?.has(extension)) {
      callback(
        new ApiError(
          400,
          'Attach a supported image, document, archive, or voice recording',
          'INVALID_CHAT_FILE'
        )
      );
      return;
    }
    file.originalname =
      basename(file.originalname)
        .replace(/[^a-zA-Z0-9._ -]/g, '_')
        .replace(/\s+/g, ' ')
        .slice(0, 180) || `attachment${extension}`;
    callback(null, true);
  },
});

export const validateChatFileSignature = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file?.mimetype.startsWith('image/')) {
    next();
    return;
  }
  validateUploadedImageSignature(req, res, next);
};
