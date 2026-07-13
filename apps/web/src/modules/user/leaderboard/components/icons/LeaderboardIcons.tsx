interface IIconProps {
  size?: number
  className?: string
}

export const FireIcon = ({ size = 14, className = '' }: IIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M12 2s-4.5 4.5-4.5 9a4.5 4.5 0 0 0 9 0C16.5 6.5 12 2 12 2Z"
      fill="currentColor"
    />
    <path
      d="M9.5 14.5C9.5 13.12 10.62 12 12 12s2.5 1.12 2.5 2.5c0 .83-.4 1.56-1.01 2.02"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity=".5"
    />
  </svg>
)

export const TrendUpIcon = ({ size = 12, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M3 17l5-5 4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 8h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const TrendDownIcon = ({ size = 12, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M3 7l5 5 4-4 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 16h5v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const TrendFlatIcon = ({ size = 12, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const SparklesIcon = ({ size = 14, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z" fill="currentColor" />
    <path d="M5 15l.9 3.1L9 19l-3.1.9L5 23l-.9-3.1L1 19l3.1-.9L5 15Z" fill="currentColor" opacity=".5" />
    <path d="M19 2l.6 2.4L22 5l-2.4.6L19 8l-.6-2.4L16 5l2.4-.6L19 2Z" fill="currentColor" opacity=".5" />
  </svg>
)

export const TrophyIcon = ({ size = 14, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M6 9H4a2 2 0 01-2-2V5h4M18 9h2a2 2 0 002-2V5h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 5h12v5a6 6 0 01-12 0V5z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 16v4M8 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const StarIcon = ({ size = 13, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
)

export const GraduationCapIcon = ({ size = 20, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 3L1 9l11 6 9-4.91V17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 12.5V17c0 0 2.5 3 7 3s7-3 7-3v-4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ChalkBoardIcon = ({ size = 20, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <rect x="2" y="3" width="20" height="13" rx="1" stroke="currentColor" strokeWidth="1.75" />
    <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const MedalIcon = ({ rank }: { rank: 1 | 2 | 3 }) => {
  const colors: Record<1 | 2 | 3, { ring: string; fill: string; text: string }> = {
    1: { ring: '#c49a2c', fill: '#fdf0c2', text: '#7c5a1e' },
    2: { ring: '#9b9a92', fill: '#f0efeb', text: '#4a4a42' },
    3: { ring: '#b87333', fill: '#f5e8d8', text: '#6b3a1e' },
  }
  const color = colors[rank]

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="10" fill={color.fill} stroke={color.ring} strokeWidth="1.5" />
      <text x="11" y="15" textAnchor="middle" fontSize="10" fontWeight="700" fill={color.text} fontFamily="var(--font-mono)">
        {rank}
      </text>
    </svg>
  )
}

export const LiveDotIcon = () => (
  <svg width="7" height="7" viewBox="0 0 7 7" aria-hidden="true">
    <circle cx="3.5" cy="3.5" r="3.5" fill="var(--success)" />
  </svg>
)

export const ChevronRightIcon = ({ size = 12, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ArrowLeftIcon = ({ size = 16, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const GlobeIcon = ({ size = 14, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
)

export const UserGroupIcon = ({ size = 14, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05C16.19 13.89 17 15.02 17 16.5V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor" opacity=".8" />
  </svg>
)

export const CalendarIcon = ({ size = 14, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
)

export const RefreshIcon = ({ size = 16, className = '' }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
