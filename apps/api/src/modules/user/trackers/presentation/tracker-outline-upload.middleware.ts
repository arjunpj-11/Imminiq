import { extname } from 'node:path';

import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { ApiError } from '../../../../shared/utils/api-error';

const MAX_OUTLINE_FILE_BYTES = 1024 * 1024;
const allowedJsonMimeTypes = new Set([
  'application/json',
  'text/json',
  'text/plain',
  'application/octet-stream',
]);

export const trackerOutlineUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_OUTLINE_FILE_BYTES,
    files: 1,
    fields: 0,
    parts: 1,
  },
  fileFilter: (_request, file, callback) => {
    if (
      extname(file.originalname).toLowerCase() !== '.json' ||
      !allowedJsonMimeTypes.has(file.mimetype.toLowerCase())
    ) {
      callback(
        new ApiError(
          400,
          'Upload a valid .json outline file',
          'INVALID_TRACKER_OUTLINE_FILE'
        )
      );
      return;
    }
    callback(null, true);
  },
});

const readUtf8 = (buffer: Buffer) => {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    throw new ApiError(
      400,
      'The outline file must use UTF-8 text encoding',
      'INVALID_TRACKER_OUTLINE_ENCODING'
    );
  }
};

export const parseTrackerOutlineUpload = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    next();
    return;
  }

  try {
    const parsed: unknown = JSON.parse(readUtf8(req.file.buffer));
    if (Array.isArray(parsed)) {
      req.body = { kind: 'topics', topics: parsed };
    } else if (
      typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      !Object.hasOwn(parsed, 'kind') &&
      Object.hasOwn(parsed, 'topics')
    ) {
      req.body = { ...parsed, kind: 'topics' };
    } else {
      req.body = parsed;
    }
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }
    next(
      new ApiError(
        400,
        'The uploaded outline is not valid JSON',
        'MALFORMED_TRACKER_OUTLINE_FILE'
      )
    );
  }
};
