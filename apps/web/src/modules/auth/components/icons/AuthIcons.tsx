import { cn } from '../../utils/auth-ui'

export const LogoIcon = ({ className = '' }: { className?: string }) => (
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

export const AlertIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={cn('shrink-0', className)}
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

export const WarningIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={cn('shrink-0', className)}
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 0 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
