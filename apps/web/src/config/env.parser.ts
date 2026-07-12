export type WebEnvironment = {
  apiUrl: string
}

export const parseWebEnvironment = (
  source: Record<string, unknown>,
): WebEnvironment => {
  const rawApiUrl = source.VITE_API_URL

  if (typeof rawApiUrl !== 'string' || rawApiUrl.trim() === '') {
    throw new Error('VITE_API_URL is required')
  }

  const apiUrl = rawApiUrl.trim().replace(/\/$/, '')
  const isRootRelative = apiUrl.startsWith('/') && !apiUrl.startsWith('//')

  if (!isRootRelative) {
    const parsed = new URL(apiUrl)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('VITE_API_URL must use HTTP or HTTPS')
    }
  }

  return { apiUrl }
}
