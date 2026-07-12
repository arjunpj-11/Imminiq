import { Upload } from '../../../../../infrastructure/database/models/upload.model'
import {
  UPLOAD_MODULE,
  UPLOAD_REFERENCE_TYPE,
} from '../../../domain/uploads.constants'
import type {
  SaveUploadRecordInput,
  SoftDeleteLatestProfileUploadInput,
} from '../../../domain/repositories/uploads.repository.interface'
import { MongoUploadsBaseRepository } from '../shared/mongo-uploads-base.repository'
import { MongoUploadsErrorMapper } from '../shared/mongo-uploads-error.mapper'
import { MongoUploadsObjectId } from '../shared/mongo-uploads-object-id'
import { MongoUploadsMapper } from '../shared/mongo-uploads.mapper'
import type {
  MongoUploadRecord,
  MongooseObjectLike,
} from '../shared/mongo-uploads.types'

export class MongoUploadsRecordRepository extends MongoUploadsBaseRepository {
  constructor(private readonly _mapper = new MongoUploadsMapper()) {
    super()
  }

  async saveUploadRecord(input: SaveUploadRecordInput) {
    return this.execute(
      'UPLOAD_RECORD_CREATE_FAILED',
      'Failed to save upload record',
      async () => {
        const upload = await Upload.create({
          userId: MongoUploadsObjectId.fromString(input.userId),
          fileName: input.file.fileName,
          fileType: input.kind,
          fileUrl: input.file.fileUrl,
          mimeType: input.file.mimeType,
          sizeBytes: input.file.sizeBytes,
          module: UPLOAD_MODULE,
          referenceType: UPLOAD_REFERENCE_TYPE,
          referenceId: MongoUploadsObjectId.fromString(input.referenceId),
          ...(input.file.storagePublicId
            ? { storagePublicId: input.file.storagePublicId }
            : {}),
        })

        return this._mapper.toUploadEntityOrThrow(
          this._mapper.toPlainRecord<MongoUploadRecord>(
            upload as MongooseObjectLike<MongoUploadRecord>,
          ),
        )
      },
      MongoUploadsErrorMapper.mapDuplicateUploadRecordError,
    )
  }

  async softDeleteLatestProfileUpload(
    input: SoftDeleteLatestProfileUploadInput,
  ) {
    return this.execute(
      'UPLOAD_DELETE_FAILED',
      'Failed to delete latest profile upload',
      async () => {
        const upload = await Upload.findOneAndUpdate(
          {
            userId: MongoUploadsObjectId.fromString(input.userId),
            fileType: input.kind,
            module: UPLOAD_MODULE,
            deletedAt: null,
          },
          {
            $set: {
              deletedAt: new Date(),
            },
          },
          {
            sort: {
              createdAt: -1,
            },
            returnDocument: 'after',
          },
        ).lean<MongoUploadRecord>()

        return Boolean(upload)
      },
    )
  }
}

export const mongoUploadsRecordRepository =
  new MongoUploadsRecordRepository()
