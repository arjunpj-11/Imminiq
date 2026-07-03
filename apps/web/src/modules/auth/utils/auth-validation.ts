export const validateIdentifier = (value: string): string | undefined => {
  const trimmed = value.trim()

  if (!trimmed) return 'Email or phone number is required.'

  const looksLikePhone = /^[+\d][\d\s\-()]{6,}$/.test(trimmed)

  if (looksLikePhone) {
    const digits = trimmed.replace(/\D/g, '')

    if (digits.length < 7) return 'Phone number seems too short.'
    if (digits.length > 15) return 'Phone number is too long.'

    return undefined
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  if (!emailRegex.test(trimmed)) {
    return 'Enter a valid email address or phone number.'
  }

  return undefined
}

export const validatePassword = (password: string, label = 'Password') => {
  if (!password) return `${label} is required.`
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (password.length > 128) return 'Password is too long.'
  if (!/[a-zA-Z]/.test(password)) return 'Must include at least one letter.'
  if (!/[0-9\W]/.test(password)) return 'Must include a number or symbol.'
  return undefined
}

export const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, level: 0, label: '', textClass: '' }

  let score = 0

  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  const level = Math.min(4, score)
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return {
    score: level,
    level,
    label: labels[level],
    textClass:
      level >= 3
        ? 'text-[var(--success)] dark:text-[var(--success)]'
        : 'text-[var(--brand-500)] dark:text-[var(--brand-500)]',
  }
}
