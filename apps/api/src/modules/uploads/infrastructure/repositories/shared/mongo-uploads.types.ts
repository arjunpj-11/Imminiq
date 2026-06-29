export type MongoIdLike = {
  toString(): string
}

export type MongoUploadRecord = {
  _id: MongoIdLike
  userId: MongoIdLike | string
  fileName: string
  fileType: string
  fileUrl: string
  mimeType: string
  sizeBytes: number
  storagePublicId?: string
  referenceId: MongoIdLike | string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export type MongooseObjectLike<T> = {
  toObject(): T
}

export type MongoDuplicateKeyError = {
  code?: number
}
