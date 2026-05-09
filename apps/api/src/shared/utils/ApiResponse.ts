export class ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
  meta?: object

  constructor(message: string, data: T | null = null, meta?: object) {
    this.success = true
    this.message = message
    this.data = data
    this.meta = meta
  }
}