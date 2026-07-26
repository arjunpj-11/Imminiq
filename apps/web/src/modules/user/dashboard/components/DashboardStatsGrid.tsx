import StatCard, { type IStatAccent } from '../../../../components/data-display/StatCard';
import StatGrid from '../../../../components/data-display/StatGrid';
import { formatCompactNumber } from '../utils/dashboard-formatters';

type DashboardStatsGridProps = {
  summary: {
    trackers: { total: number; active: number; completed: number };
    stats: { totalSubtopicsCompleted: number; publishedTrackers: number };
    user: { coinBalance: number };
  };
  showTrackerStats?: boolean;
};

const ACCENTS: IStatAccent[] = [
  { light: 'var(--brand-500)', dark: 'var(--brand-500)' },
  { light: 'var(--success)', dark: 'var(--success)' },
  { light: 'var(--warning)', dark: 'var(--warning)' },
  { light: 'var(--info)', dark: 'var(--info)' },
];

export default function DashboardStatsGrid({
  summary,
  showTrackerStats = true,
}: DashboardStatsGridProps) {
  const trackerCards = [
    {
      label: 'Total Trackers',
      value: formatCompactNumber(summary.trackers.total),
      helper: `${summary.trackers.active} active trackers`,
    },
    {
      label: 'Completed',
      value: formatCompactNumber(summary.trackers.completed),
      helper: 'Roadmaps finished',
    },
    {
      label: 'Subtopics Done',
      value: formatCompactNumber(summary.stats.totalSubtopicsCompleted),
      helper: 'Across all trackers',
    },
  ];
  const cards = [
    ...(showTrackerStats ? trackerCards : []),
    {
      label: 'Coins',
      value: formatCompactNumber(summary.user.coinBalance),
      helper: 'Rewards balance',
    },
  ];

  return (
    <StatGrid>
      {cards.map((card, index) => (
        <StatCard key={card.label} {...card} accent={ACCENTS[index]} />
      ))}
    </StatGrid>
  );
}
