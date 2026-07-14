export const ACTIVITY_HEATMAP_INTENSITIES = ['none', 'low', 'medium', 'high'] as const;

export type ActivityHeatmapIntensity = (typeof ACTIVITY_HEATMAP_INTENSITIES)[number];
