export const maskIdentifier = (identifier?: string) => {
  if (!identifier) return 'your registered account'

  if (identifier.includes('@')) {
    const [local, domain] = identifier.split('@')

    if (!local || !domain) return identifier

    const maskedLocal =
      local.length <= 2 ? `${local[0]}***` : `${local[0]}***${local.slice(-1)}`

    return `${maskedLocal}@${domain}`
  }

  const digits = identifier.replace(/\D/g, '')

  if (digits.length < 4) return identifier

  return `${identifier.slice(0, 3)} ****** ${identifier.slice(-3)}`
}

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}
