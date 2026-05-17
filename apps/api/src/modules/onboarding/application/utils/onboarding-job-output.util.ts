const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export const getTrackerIdFromOutputData = (
  outputData: Record<string, unknown> | undefined
) => {
  const trackerId = outputData?.trackerId

  return typeof trackerId === 'string'
    ? trackerId
    : null
}

export const getEvaluationFromOutputData = (
  outputData: Record<string, unknown> | undefined
) => {
  const evaluation = outputData?.evaluation

  return isRecord(evaluation)
    ? evaluation
    : null
}
