import {
  TrendDownIcon,
  TrendFlatIcon,
  TrendUpIcon,
} from './icons/LeaderboardIcons'

export default function LeaderboardTrendBadge({ trend }: { trend: number }) {
  if (trend > 0) {
    return (
      <span
        className="inline-flex items-center gap-0.5 font-['DM_Mono',monospace] text-[11px] font-bold text-[#b84c2b] tabular-nums dark:text-[#e8816a]"
        aria-label={`Moved up ${trend} positions`}
      >
        <TrendUpIcon /> {trend}
      </span>
    )
  }

  if (trend < 0) {
    return (
      <span
        className="inline-flex items-center gap-0.5 font-['DM_Mono',monospace] text-[11px] font-bold text-[#9b8a82] tabular-nums dark:text-[#8a7d75]"
        aria-label={`Moved down ${Math.abs(trend)} positions`}
      >
        <TrendDownIcon /> {Math.abs(trend)}
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-0.5 font-['DM_Mono',monospace] text-[11px] text-[#9b9a92] tabular-nums"
      aria-label="No rank movement"
    >
      <TrendFlatIcon /> 0
    </span>
  )
}
