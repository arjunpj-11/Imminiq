import {
  LEADERBOARD_DEFAULT_SCOPE,
  LEADERBOARD_DEFAULT_SECTION,
  LEADERBOARD_SCOPES,
  LEADERBOARD_SECTIONS,
} from '../constants/leaderboard.constants'
import type {
  LeaderboardScope,
  LeaderboardSection,
} from '../types/leaderboard.types'

export const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const formatNumber = (value: number): string =>
  value.toLocaleString()

export const formatRank = (rank: number | null): string =>
  rank === null ? '—' : `#${rank.toLocaleString()}`

export const formatRankTrendHint = (trend: number): string => {
  if (trend > 0) {
    return `↑ ${trend.toLocaleString()} position${trend === 1 ? '' : 's'} this week`
  }

  if (trend < 0) {
    const movement = Math.abs(trend)
    return `↓ ${movement.toLocaleString()} position${movement === 1 ? '' : 's'} this week`
  }

  return 'No rank movement this week'
}

export const formatGrowthLabel = (growthPercent: number): string => {
  if (growthPercent > 0) return `↑ ${growthPercent}%`
  if (growthPercent < 0) return `↓ ${Math.abs(growthPercent)}%`
  return '0%'
}

export const formatTargetRankMessage = (
  xpToTargetRank: number | null,
  targetRank: number,
): string => {
  if (xpToTargetRank === 0) {
    return `You are inside the Top ${targetRank}`
  }

  if (xpToTargetRank === null) {
    return `Top ${targetRank} target is not available yet`
  }

  return `${formatNumber(xpToTargetRank)} XP away from Top ${targetRank}`
}

export const parseLeaderboardSection = (
  value: string | null,
): LeaderboardSection =>
  LEADERBOARD_SECTIONS.includes(value as LeaderboardSection)
    ? (value as LeaderboardSection)
    : LEADERBOARD_DEFAULT_SECTION

export const parseLeaderboardScope = (
  value: string | null,
): LeaderboardScope =>
  LEADERBOARD_SCOPES.includes(value as LeaderboardScope)
    ? (value as LeaderboardScope)
    : LEADERBOARD_DEFAULT_SCOPE
