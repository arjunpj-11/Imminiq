import { basename, extname } from 'node:path';
import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/api-error';

type ImageKind = 'jpeg' | 'png' | 'webp';

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const mimeToKind = new Map<string, ImageKind>([
  ['image/jpeg', 'jpeg'],
  ['image/jpg', 'jpeg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

const extensionToKind = new Map<string, ImageKind>([
  ['.jpg', 'jpeg'],
  ['.jpeg', 'jpeg'],
  ['.png', 'png'],
  ['.webp', 'webp'],
]);

const startsWithBytes = (buffer: Buffer, signature: number[]): boolean => {
  if (buffer.length < signature.length) {
    return false;
  }

  return signature.every((byte, index) => buffer[index] === byte);
};

const detectImageKind = (buffer: Buffer): ImageKind | null => {
  if (startsWithBytes(buffer, JPEG_SIGNATURE)) {
    return 'jpeg';
  }

  if (startsWithBytes(buffer, PNG_SIGNATURE)) {
    return 'png';
  }

  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
};

const sanitizeFilename = (originalName: string) => {
  const cleanBaseName = basename(originalName)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 180);

  return cleanBaseName || 'profile-image';
};

export const validateUploadedImageSignature = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const file = req.file;

  if (!file) {
    next();
    return;
  }

  const detectedKind = detectImageKind(file.buffer);
  const mimeKind = mimeToKind.get(file.mimetype);
  const extensionKind = extensionToKind.get(extname(file.originalname).toLowerCase());

  if (!detectedKind) {
    next(
      new ApiError(
        400,
        'Uploaded file is not a supported JPG, PNG, or WEBP image',
        'INVALID_IMAGE_SIGNATURE'
      )
    );
    return;
  }

  if (!mimeKind || detectedKind !== mimeKind) {
    next(
      new ApiError(
        400,
        'Image content does not match its MIME type',
        'IMAGE_MIME_SIGNATURE_MISMATCH'
      )
    );
    return;
  }

  if (!extensionKind || detectedKind !== extensionKind) {
    next(
      new ApiError(
        400,
        'Image content does not match its file extension',
        'IMAGE_EXTENSION_SIGNATURE_MISMATCH'
      )
    );
    return;
  }

  file.originalname = sanitizeFilename(file.originalname);

  next();
};
