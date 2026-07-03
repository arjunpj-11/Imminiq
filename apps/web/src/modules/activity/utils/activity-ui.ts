import { cn } from '../../../lib/cn'
export { cn }

import type { ActivityHeatmapIntensity } from '../types/activity.types'

export const ACTIVITY_STAT_ACCENTS = [
  { light: 'var(--brand-500)', dark: 'var(--brand-500)' },
  { light: 'var(--success)', dark: 'var(--success)' },
  { light: 'var(--warning)', dark: 'var(--warning)' },
  { light: 'var(--info)', dark: 'var(--info)' },
] as const

export const ACTIVITY_HEATMAP_INTENSITY_CLASS: Record<
  ActivityHeatmapIntensity,
  string
> = {
  none: 'bg-[rgba(26,23,20,0.09)] dark:bg-[rgba(242,240,235,0.07)]',
  low: 'bg-[rgba(184,76,43,0.18)] dark:bg-[rgba(232,129,106,0.22)]',
  medium: 'bg-[rgba(184,76,43,0.38)] dark:bg-[rgba(232,129,106,0.42)]',
  high: 'bg-[var(--brand-500)] dark:bg-[var(--brand-500)]',
}
