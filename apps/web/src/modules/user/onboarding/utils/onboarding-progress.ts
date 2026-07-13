export const fallbackPhaseByProgress = (progress: number) => {
  if (progress >= 80) return 4
  if (progress >= 60) return 3
  if (progress >= 35) return 2
  if (progress >= 15) return 1
  return 0
}

export const normalizeProgressStepIndex = (
  rawStep: number | undefined,
  completedSteps: number | undefined,
  progress: number,
  stepCount = 5,
) => {
  const lastStepIndex = Math.max(0, stepCount - 1)

  if (typeof completedSteps === 'number') {
    if (completedSteps >= stepCount) return lastStepIndex
    if (completedSteps >= 0 && completedSteps <= lastStepIndex) {
      return completedSteps
    }
  }

  if (typeof rawStep === 'number') {
    if (rawStep >= 1 && rawStep <= stepCount) return rawStep - 1
    if (rawStep >= 0 && rawStep <= lastStepIndex) return rawStep
  }

  return Math.min(lastStepIndex, fallbackPhaseByProgress(progress))
}

export const clampProgress = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value)))
