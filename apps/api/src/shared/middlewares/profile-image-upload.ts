import { extname } from 'node:path';
import multer from 'multer';

import { ApiError } from '../utils/ApiError';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const MAX_BANNER_SIZE = 8 * 1024 * 1024;

const imageMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const memoryStorage = multer.memoryStorage();

const hasAllowedExtension = (originalName: string) => {
  return imageExtensions.has(extname(originalName).trim().toLowerCase());
};

const createImageUpload = (maxSize: number) =>
  multer({
    storage: memoryStorage,
    limits: {
      fileSize: maxSize,
      files: 1,
    },
    fileFilter: (_req, file, callback) => {
      if (!imageMimeTypes.has(file.mimetype)) {
        callback(
          new ApiError(400, 'Only JPG, PNG, and WEBP images are allowed', 'INVALID_IMAGE_MIME_TYPE')
        );
        return;
      }

      if (!hasAllowedExtension(file.originalname)) {
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

export const avatarUpload = createImageUpload(MAX_AVATAR_SIZE);
export const bannerUpload = createImageUpload(MAX_BANNER_SIZE);
