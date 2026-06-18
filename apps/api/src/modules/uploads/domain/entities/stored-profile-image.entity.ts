export type StoredProfileImageEntityProps = {
  fileUrl: string
  fileName: string
  fileType: string
  mimeType: string
  sizeBytes: number
  storagePublicId?: string
}

export class StoredProfileImageEntity {
  readonly fileUrl: string
  readonly fileName: string
  readonly fileType: string
  readonly mimeType: string
  readonly sizeBytes: number
  readonly storagePublicId?: string

  constructor(props: StoredProfileImageEntityProps) {
    this.fileUrl = props.fileUrl
    this.fileName = props.fileName
    this.fileType = props.fileType
    this.mimeType = props.mimeType
    this.sizeBytes = props.sizeBytes

    if (props.storagePublicId !== undefined) {
      this.storagePublicId = props.storagePublicId
    }
  }
}
