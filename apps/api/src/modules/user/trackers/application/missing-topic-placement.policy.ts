export type NewTopLevelPlacement = {
  isNewTopLevel: boolean;
  relation?: 'before' | 'after';
  referenceTitle?: string;
};

const normalizeTitle = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ');

const stripLeadingNumbering = (value: string): string =>
  value.trim().replace(/^(?:topic\s+)?\d+[\s._:-]*/i, '');

export const findBestMatchingParent = <T extends { title: string }>(
  items: T[],
  suggestedParentTitle: string
): T | null => {
  const target = normalizeTitle(suggestedParentTitle);
  const strippedTarget = normalizeTitle(stripLeadingNumbering(suggestedParentTitle));

  const exactMatch = items.find((item) => {
    const norm = normalizeTitle(item.title);
    return norm === target || norm === strippedTarget;
  });

  if (exactMatch) {
    return exactMatch;
  }

  return (
    items.find((item) => {
      const normalizedTitle = normalizeTitle(item.title);
      const strippedTitle = normalizeTitle(stripLeadingNumbering(item.title));
      const searchTarget = strippedTarget || target;

      return (
        normalizedTitle.includes(searchTarget) ||
        searchTarget.includes(normalizedTitle) ||
        (strippedTitle.length > 0 &&
          (strippedTitle.includes(searchTarget) || searchTarget.includes(strippedTitle)))
      );
    }) ?? null
  );
};

const normalizePlacementReference = (value: string): string =>
  value
    .trim()
    .replace(/^["'""'']+/, '')
    .replace(/["'""''.)\]]+$/, '')
    .trim();

export const parseNewTopLevelPlacement = (suggestedParentTitle: string): NewTopLevelPlacement => {
  const placement = suggestedParentTitle.trim();

  if (!/^new\s+top\s+level\s+topic/i.test(placement)) {
    return { isNewTopLevel: false };
  }

  const followMatch = placement.match(/should\s+follow\s+(.+?)(?:\)|$)/i);

  if (followMatch?.[1]) {
    return {
      isNewTopLevel: true,
      relation: 'after',
      referenceTitle: normalizePlacementReference(followMatch[1]),
    };
  }

  const precedeMatch = placement.match(/should\s+(?:precede|come\s+before)\s+(.+?)(?:\)|$)/i);

  if (precedeMatch?.[1]) {
    return {
      isNewTopLevel: true,
      relation: 'before',
      referenceTitle: normalizePlacementReference(precedeMatch[1]),
    };
  }

  return { isNewTopLevel: true };
};

export const formatNumberedTopicTitle = (
  rawTitle: string,
  orderNumber: number,
  shouldNumber: boolean
): string => {
  const cleanTitle = rawTitle.trim().replace(/^(?:topic\s+)?\d+[\s._:-]*/i, '').trim() || rawTitle.trim();
  if (!shouldNumber) {
    return cleanTitle;
  }
  return `${orderNumber}. ${cleanTitle}`;
};
