import type { ProfileUploadKind } from '../types/uploads.types'

export type UploadedProfileImageEntityProps = {
  id: string
  userId: string
  kind: ProfileUploadKind
  fileUrl: string
  fileName: string
  fileType: string
  mimeType: string
  sizeBytes: number
  referenceId: string
  storagePublicId?: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export class UploadedProfileImageEntity {
  readonly id: string
  readonly userId: string
  readonly kind: ProfileUploadKind
  readonly fileUrl: string
  readonly fileName: string
  readonly fileType: string
  readonly mimeType: string
  readonly sizeBytes: number
  readonly referenceId: string
  readonly storagePublicId?: string
  readonly createdAt?: Date
  readonly updatedAt?: Date
  readonly deletedAt?: Date | null

  constructor(props: UploadedProfileImageEntityProps) {
    this.id = props.id
    this.userId = props.userId
    this.kind = props.kind
    this.fileUrl = props.fileUrl
    this.fileName = props.fileName
    this.fileType = props.fileType
    this.mimeType = props.mimeType
    this.sizeBytes = props.sizeBytes
    this.referenceId = props.referenceId

    if (props.storagePublicId !== undefined) {
      this.storagePublicId = props.storagePublicId
    }

    if (props.createdAt !== undefined) {
      this.createdAt = props.createdAt
    }

    if (props.updatedAt !== undefined) {
      this.updatedAt = props.updatedAt
    }

    if (props.deletedAt !== undefined) {
      this.deletedAt = props.deletedAt
    }
  }
}
