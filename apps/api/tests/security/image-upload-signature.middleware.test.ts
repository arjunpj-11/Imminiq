import { describe, expect, it } from 'vitest'
import type { Request } from 'express'

import { validateUploadedImageSignature } from '../../src/shared/middlewares/image-upload-signature.middleware'
import { ApiError } from '../../src/shared/utils/ApiError'
import {
  createMockRequest,
  createMockResponse,
  createNext,
  firstNextError,
} from '../helpers/middleware-test-helpers'

const pngBuffer = Buffer.from([
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a,
  0x00,
  0x00,
  0x00,
  0x00,
])

const jpegBuffer = Buffer.from([
  0xff,
  0xd8,
  0xff,
  0xe0,
  0x00,
  0x10,
  0x4a,
  0x46,
  0x49,
  0x46,
])

const createUploadRequest = (
  file: Partial<Express.Multer.File>
): Request => {
  return createMockRequest({
    file: {
      fieldname: 'file',
      originalname: 'image.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: file.buffer?.length ?? 0,
      destination: '',
      filename: '',
      path: '',
      stream: undefined as never,
      buffer: pngBuffer,
      ...file,
    },
  })
}

describe('validateUploadedImageSignature', () => {
  it('allows a valid PNG whose MIME, extension, and signature agree', () => {
    const req = createUploadRequest({
      originalname: 'avatar.png',
      mimetype: 'image/png',
      buffer: pngBuffer,
    })
    const res = createMockResponse()
    const next = createNext()

    validateUploadedImageSignature(req, res as never, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(firstNextError(next)).toBeUndefined()
  })

  it('allows a valid JPEG whose MIME, extension, and signature agree', () => {
    const req = createUploadRequest({
      originalname: 'avatar.jpg',
      mimetype: 'image/jpeg',
      buffer: jpegBuffer,
    })
    const res = createMockResponse()
    const next = createNext()

    validateUploadedImageSignature(req, res as never, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(firstNextError(next)).toBeUndefined()
  })

  it('rejects a fake image payload with no supported image signature', () => {
    const req = createUploadRequest({
      originalname: 'payload.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('not-an-image'),
    })
    const res = createMockResponse()
    const next = createNext()

    validateUploadedImageSignature(req, res as never, next)

    const error = firstNextError(next)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      statusCode: 400,
      code: 'INVALID_IMAGE_SIGNATURE',
    })
  })

  it('rejects a PNG signature sent as JPEG MIME type', () => {
    const req = createUploadRequest({
      originalname: 'avatar.jpg',
      mimetype: 'image/jpeg',
      buffer: pngBuffer,
    })
    const res = createMockResponse()
    const next = createNext()

    validateUploadedImageSignature(req, res as never, next)

    const error = firstNextError(next)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      statusCode: 400,
      code: 'IMAGE_MIME_SIGNATURE_MISMATCH',
    })
  })

  it('rejects a PNG file renamed with a .jpg extension', () => {
    const req = createUploadRequest({
      originalname: 'avatar.jpg',
      mimetype: 'image/png',
      buffer: pngBuffer,
    })
    const res = createMockResponse()
    const next = createNext()

    validateUploadedImageSignature(req, res as never, next)

    const error = firstNextError(next)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      statusCode: 400,
      code: 'IMAGE_EXTENSION_SIGNATURE_MISMATCH',
    })
  })

  it('sanitizes stored original filenames after successful validation', () => {
    const req = createUploadRequest({
      originalname: '../../unsafe image.png',
      mimetype: 'image/png',
      buffer: pngBuffer,
    })
    const res = createMockResponse()
    const next = createNext()

    validateUploadedImageSignature(req, res as never, next)

    expect(firstNextError(next)).toBeUndefined()
    expect(req.file?.originalname).toBe('unsafe_image.png')
  })
})
