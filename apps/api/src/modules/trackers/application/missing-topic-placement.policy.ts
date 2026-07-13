export type NewTopLevelPlacement = {
  isNewTopLevel: boolean
  relation?: 'before' | 'after'
  referenceTitle?: string
}

const normalizeTitle = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')

export const findBestMatchingParent = <T extends { title: string }>(
  items: T[],
  suggestedParentTitle: string,
): T | null => {
  const target = normalizeTitle(suggestedParentTitle)
  const exactMatch = items.find((item) => normalizeTitle(item.title) === target)

  if (exactMatch) {
    return exactMatch
  }

  return (
    items.find((item) => {
      const normalizedTitle = normalizeTitle(item.title)
      return normalizedTitle.includes(target) || target.includes(normalizedTitle)
    }) ?? null
  )
}

const normalizePlacementReference = (value: string): string =>
  value
    .trim()
    .replace(/^["'""'']+/, '')
    .replace(/["'""''.)\]]+$/, '')
    .trim()

export const parseNewTopLevelPlacement = (
  suggestedParentTitle: string,
): NewTopLevelPlacement => {
  const placement = suggestedParentTitle.trim()

  if (!/^new\s+top\s+level\s+topic/i.test(placement)) {
    return { isNewTopLevel: false }
  }

  const followMatch = placement.match(/should\s+follow\s+(.+?)(?:\)|$)/i)

  if (followMatch?.[1]) {
    return {
      isNewTopLevel: true,
      relation: 'after',
      referenceTitle: normalizePlacementReference(followMatch[1]),
    }
  }

  const precedeMatch = placement.match(
    /should\s+(?:precede|come\s+before)\s+(.+?)(?:\)|$)/i,
  )

  if (precedeMatch?.[1]) {
    return {
      isNewTopLevel: true,
      relation: 'before',
      referenceTitle: normalizePlacementReference(precedeMatch[1]),
    }
  }

  return { isNewTopLevel: true }
}
