import type { ActivityHeatmapIntensity } from '../types/activity.types'

export const cn = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(' ')

export const ACTIVITY_STAT_ACCENTS = [
  { light: '#b84c2b', dark: '#e8816a' },
  { light: '#2d6a47', dark: '#3dbf82' },
  { light: '#c98000', dark: '#f0a832' },
  { light: '#3b6cb7', dark: '#4a9eff' },
] as const

export const ACTIVITY_HEATMAP_INTENSITY_CLASS: Record<
  ActivityHeatmapIntensity,
  string
> = {
  none: 'bg-[rgba(26,23,20,0.09)] dark:bg-[rgba(242,240,235,0.07)]',
  low: 'bg-[rgba(184,76,43,0.18)] dark:bg-[rgba(232,129,106,0.22)]',
  medium: 'bg-[rgba(184,76,43,0.38)] dark:bg-[rgba(232,129,106,0.42)]',
  high: 'bg-[#b84c2b] dark:bg-[#e8816a]',
}
