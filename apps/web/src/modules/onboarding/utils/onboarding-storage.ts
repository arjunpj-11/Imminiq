import type { Level } from '../types/onboarding.types'

export const getInitialLevel = (): Level => {
  const savedLevel = sessionStorage.getItem('imminiq_level') as Level | null

  if (
    savedLevel === 'beginner' ||
    savedLevel === 'intermediate' ||
    savedLevel === 'advanced'
  ) {
    return savedLevel
  }

  return 'intermediate'
}
