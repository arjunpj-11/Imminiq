export const normalizeTitle = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
}

export const findBestMatchingParent = <T extends { title: string }>(
  items: T[],
  suggestedParentTitle: string
): T | null => {
  const target = normalizeTitle(suggestedParentTitle)

  const exactMatch = items.find((item) => {
    return normalizeTitle(item.title) === target
  })

  if (exactMatch) {
    return exactMatch
  }

  const softMatch = items.find((item) => {
    const normalizedItemTitle = normalizeTitle(item.title)

    return (
      normalizedItemTitle.includes(target) ||
      target.includes(normalizedItemTitle)
    )
  })

  return softMatch || null
}
