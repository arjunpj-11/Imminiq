import { extname } from 'node:path';
import multer from 'multer';
import { env } from '../../config/env';

import { ApiError } from '../utils/ApiError';

const storage = multer.memoryStorage();

const imageMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: env.UPLOAD_IMAGE_MAX_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const extension = extname(file.originalname).trim().toLowerCase();

    if (!imageMimeTypes.has(file.mimetype)) {
      callback(
        new ApiError(400, 'Only JPG, PNG, and WEBP images are allowed', 'INVALID_IMAGE_MIME_TYPE')
      );
      return;
    }

    if (!imageExtensions.has(extension)) {
      callback(
        new ApiError(
          400,
          'Image filename must use .jpg, .jpeg, .png, or .webp',
          'INVALID_IMAGE_EXTENSION'
        )
      );
      return;
    }

    callback(null, true);
  },
});
