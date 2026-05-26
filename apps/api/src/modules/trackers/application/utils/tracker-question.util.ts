import { createHash } from 'crypto'

export const hashQuestion = (question: string) => {
  return createHash('sha256')
    .update(question.trim().toLowerCase())
    .digest('hex')
}

export const getDocumentId = (document: unknown) => {
  const doc = document as { _id?: unknown }

  if (typeof doc._id === 'string') return doc._id

  if (
    doc._id &&
    typeof doc._id === 'object' &&
    'toString' in doc._id
  ) {
    return doc._id.toString()
  }

  return null
}
