interface ActivityIconProps {
  size?: number
  className?: string
}

export const FireIcon = ({
  size = 14,
  className = '',
}: ActivityIconProps) => (
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

export const TrendUpIcon = ({
  size = 12,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M3 17l5-5 4 4 7-8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 8h5v5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const TrendDownIcon = ({
  size = 12,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M3 7l5 5 4-4 7 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 16h5v-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const SparklesIcon = ({
  size = 14,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z"
      fill="currentColor"
    />
    <path
      d="M5 15l.9 3.1L9 19l-3.1.9L5 23l-.9-3.1L1 19l3.1-.9L5 15Z"
      fill="currentColor"
      opacity=".5"
    />
    <path
      d="M19 2l.6 2.4L22 5l-2.4.6L19 8l-.6-2.4L16 5l2.4-.6L19 2Z"
      fill="currentColor"
      opacity=".5"
    />
  </svg>
)

export const TrophyIcon = ({
  size = 14,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M6 9H4a2 2 0 01-2-2V5h4M18 9h2a2 2 0 002-2V5h-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M6 5h12v5a6 6 0 01-12 0V5z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M12 16v4M8 20h8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

export const GraduationCapIcon = ({
  size = 15,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M12 3L1 9l11 6 9-4.91V17"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 12.5V17c0 0 2.5 3 7 3s7-3 7-3v-4.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const ClipboardCheckIcon = ({
  size = 15,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <rect
      x="5"
      y="3"
      width="14"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path
      d="M9 3h6M9 12l2 2 4-4"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const UsersIcon = ({
  size = 15,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <circle
      cx="9"
      cy="7"
      r="4"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path
      d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
)

export const StarIcon = ({
  size = 13,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
)

export const ActivityIcon = ({
  size = 15,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <polyline
      points="22 12 18 12 15 21 9 3 6 12 2 12"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const CalendarIcon = ({
  size = 16,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M16 2v4M8 2v4M3 10h18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

export const LightningIcon = ({
  size = 13,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M13 2L4.5 13.5H11V22l8.5-11.5H13V2Z"
      fill="currentColor"
    />
  </svg>
)

export const CoinsIcon = ({
  size = 13,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <ellipse
      cx="12"
      cy="6"
      rx="7"
      ry="3"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6"
      stroke="currentColor"
      strokeWidth="1.7"
    />
  </svg>
)

export const CheckIcon = ({
  size = 13,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M5 12.5l4 4L19 7"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const RefreshIcon = ({
  size = 14,
  className = '',
}: ActivityIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M20 6v5h-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.2 9A8 8 0 106.3 18.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

export const LiveDotIcon = () => (
  <svg
    width="7"
    height="7"
    viewBox="0 0 7 7"
    aria-hidden="true"
  >
    <circle cx="3.5" cy="3.5" r="3.5" fill="#4caf7d" />
  </svg>
)
