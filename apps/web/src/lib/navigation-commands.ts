export type NavigationShortcut = readonly [prefix: string, destination: string]

export interface INavigationCommandDefinition {
  id: string
  label: string
  description: string
  path: string
  keywords: readonly string[]
  shortcut?: NavigationShortcut
}

export const NAVIGATION_COMMANDS: readonly INavigationCommandDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Your learning overview',
    path: '/dashboard',
    keywords: ['home', 'overview', 'main page', 'learning overview'],
    shortcut: ['g', 'd'],
  },
  {
    id: 'trackers',
    label: 'Trackers',
    description: 'Continue or manage learning roadmaps',
    path: '/trackers',
    keywords: ['tracker', 'my trackers', 'roadmap', 'roadmaps', 'learning tracks', 'topics'],
    shortcut: ['g', 't'],
  },
  {
    id: 'published-trackers',
    label: 'Published trackers',
    description: 'Manage the roadmaps you have shared',
    path: '/trackers/published',
    keywords: ['published', 'shared trackers', 'my published roadmaps'],
  },
  {
    id: 'mock-tests',
    label: 'Mock tests',
    description: 'Generate, attempt and review tests',
    path: '/mock-tests',
    keywords: ['mock test', 'tests', 'exam', 'quiz', 'practice', 'assessment', 'generate test'],
    shortcut: ['g', 'm'],
  },
  {
    id: 'community',
    label: 'Community',
    description: 'Explore shared trackers',
    path: '/community',
    keywords: ['browse', 'public', 'discover', 'shared roadmaps', 'community trackers'],
    shortcut: ['g', 'c'],
  },
  {
    id: 'verify',
    label: 'Verify and earn',
    description: 'Review community submissions',
    path: '/verify-and-earn',
    keywords: ['verify', 'verification', 'review', 'vote', 'coins', 'xp', 'earn'],
    shortcut: ['g', 'v'],
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    description: 'See ranks, XP and rewards',
    path: '/leaderboard',
    keywords: ['rank', 'ranking', 'xp', 'top learners', 'leader board'],
    shortcut: ['g', 'l'],
  },
  {
    id: 'leaderboard-rewards',
    label: 'Leaderboard rewards',
    description: 'See ranking rewards and XP rules',
    path: '/leaderboard/rewards',
    keywords: ['rewards', 'coins', 'xp rules', 'ranking rewards'],
  },
  {
    id: 'activity',
    label: 'Activity',
    description: 'Review streaks and learning history',
    path: '/activity',
    keywords: ['history', 'heatmap', 'progress', 'streak', 'learning activity'],
    shortcut: ['g', 'a'],
  },
  {
    id: 'friends',
    label: 'Friends',
    description: 'Friends and pending invites',
    path: '/friends',
    keywords: ['people', 'requests', 'invites', 'social', 'friend list'],
    shortcut: ['g', 'f'],
  },
  {
    id: 'find-friends',
    label: 'Find people',
    description: 'Search for learners to add',
    path: '/friends/search',
    keywords: ['find friends', 'search users', 'add friend', 'learners', 'people search'],
  },
  {
    id: 'profile',
    label: 'Profile',
    description: 'Open your public learning profile',
    path: '/profile',
    keywords: ['account', 'avatar', 'banner', 'bio', 'skills', 'my profile'],
    shortcut: ['g', 'p'],
  },
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'Theme and application preferences',
    path: '/settings/preferences',
    keywords: ['settings', 'theme', 'appearance', 'dark mode', 'light mode', 'application settings'],
    shortcut: ['g', 's'],
  },
  {
    id: 'notifications-settings',
    label: 'Notification settings',
    description: 'Control which notifications you receive',
    path: '/settings/notifications',
    keywords: ['settings', 'notifications', 'email alerts', 'push alerts'],
  },
  {
    id: 'security',
    label: 'Account security',
    description: 'Password, sessions and two-factor authentication',
    path: '/settings/security',
    keywords: ['settings', 'password', '2fa', 'two factor', 'authenticator', 'sessions', 'security'],
  },
  {
    id: 'privacy-settings',
    label: 'Privacy settings',
    description: 'Manage profile visibility and privacy',
    path: '/settings/privacy',
    keywords: ['settings', 'privacy', 'visibility', 'public profile'],
  },
] as const

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const compactSearchText = (value: string) => normalizeSearchText(value).replace(/\s+/g, '')

const isSubsequence = (needle: string, haystack: string) => {
  if (!needle) return true
  let needleIndex = 0
  for (const character of haystack) {
    if (character === needle[needleIndex]) needleIndex += 1
    if (needleIndex === needle.length) return true
  }
  return false
}

const isOneEditAway = (left: string, right: string) => {
  if (Math.abs(left.length - right.length) > 1) return false

  let leftIndex = 0
  let rightIndex = 0
  let edits = 0

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1
      rightIndex += 1
      continue
    }

    edits += 1
    if (edits > 1) return false

    if (left.length > right.length) leftIndex += 1
    else if (right.length > left.length) rightIndex += 1
    else {
      leftIndex += 1
      rightIndex += 1
    }
  }

  return edits + Number(leftIndex < left.length || rightIndex < right.length) <= 1
}

interface ISearchableCommand {
  label: string
  description: string
  keywords: readonly string[]
  path?: string
  shortcut?: readonly string[]
}

const tokenScore = (queryToken: string, candidateToken: string) => {
  if (queryToken === candidateToken) return 120
  if (candidateToken.startsWith(queryToken)) return 95
  if (candidateToken.includes(queryToken)) return 70
  if (queryToken.length >= 3 && isSubsequence(queryToken, candidateToken)) return 42
  if (queryToken.length >= 4 && isOneEditAway(queryToken, candidateToken)) return 38
  return -1
}

/**
 * Returns a positive relevance score when a command matches the query, or -1
 * when it should be excluded. Matching is token-aware, typo-tolerant and also
 * understands compact shortcut queries such as "gd".
 */
export const scoreCommandSearch = (command: ISearchableCommand, rawQuery: string) => {
  const query = normalizeSearchText(rawQuery)
  if (!query) return 0

  const compactQuery = compactSearchText(rawQuery)
  const label = normalizeSearchText(command.label)
  const description = normalizeSearchText(command.description)
  const path = normalizeSearchText(command.path ?? '')
  const keywords = command.keywords.map(normalizeSearchText)
  const shortcut = command.shortcut?.map(normalizeSearchText).filter(Boolean) ?? []
  const compactShortcut = shortcut.join('')
  const compactLabel = compactSearchText(command.label)

  if (query === label) return 1_200
  if (compactQuery && compactQuery === compactShortcut) return 1_150
  if (label.startsWith(query)) return 1_050
  if (compactLabel.startsWith(compactQuery)) return 1_000
  if (keywords.some((keyword) => keyword === query)) return 960
  if (keywords.some((keyword) => keyword.startsWith(query))) return 900

  const searchablePhrases = [label, description, path, ...keywords, shortcut.join(' ')]
  if (searchablePhrases.some((phrase) => phrase.includes(query))) return 820

  const candidateTokens = searchablePhrases.flatMap((phrase) => phrase.split(/\s+/)).filter(Boolean)
  const queryTokens = query.split(/\s+/).filter(Boolean)
  let score = 0

  for (const queryToken of queryTokens) {
    let best = -1
    for (const candidateToken of candidateTokens) {
      best = Math.max(best, tokenScore(queryToken, candidateToken))
    }
    if (best < 0) return -1
    score += best
  }

  return score + Math.max(0, 100 - label.length)
}

export const formatNavigationShortcut = (shortcut: NavigationShortcut) =>
  shortcut.map((key) => key.toUpperCase()).join(' ')

export const findNavigationCommandByShortcut = (prefix: string, destination: string) =>
  NAVIGATION_COMMANDS.find(
    (command) =>
      command.shortcut?.[0].toLowerCase() === prefix.toLowerCase() &&
      command.shortcut?.[1].toLowerCase() === destination.toLowerCase(),
  )
