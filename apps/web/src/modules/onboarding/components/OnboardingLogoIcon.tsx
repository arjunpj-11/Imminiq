import { cn } from '../utils/cn'

type OnboardingLogoIconProps = {
  className?: string
}

export const OnboardingLogoIcon = ({ className = '' }: OnboardingLogoIconProps) => {
  return (
    <svg
      className={cn('block shrink-0 rounded-xl', className)}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="10" y="10" width="80" height="80" rx="18" fill="#050505" />

      <g transform="translate(-5, 1)">
        <rect x="31" y="35" width="9" height="34" rx="4.5" fill="#fff8ed" />
        <circle cx="35.5" cy="28.5" r="5.3" fill="#f15a35" />

        <path
          d="M64 32.8 C73.8 34.7 79.5 42.2 79.5 51.5 C79.5 61.8 71.2 68 60.2 68 C53.2 68 48.2 65.5 45.1 60.8"
          fill="none"
          stroke="#fff8ed"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <line
          x1="63.8"
          y1="55.5"
          x2="75.8"
          y2="67.5"
          stroke="#f15a35"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
