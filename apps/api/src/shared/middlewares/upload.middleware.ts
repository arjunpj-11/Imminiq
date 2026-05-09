import multer from 'multer'
import { ApiError } from '../utils/ApiError'

const storage = multer.memoryStorage()

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new ApiError(400, 'Only image files allowed', 'INVALID_FILE') as any)
    }
    cb(null, true)
  },
})