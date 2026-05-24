import type { ReactNode } from 'react'

export const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(' ')
}

export const scrollbarClass =
  '[scrollbar-width:thin] [scrollbar-color:#b84c2b_transparent] dark:[scrollbar-color:#e8816a_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(184,76,43,0.35)] dark:[&::-webkit-scrollbar-thumb]:bg-[rgba(232,129,106,0.45)] [&::-webkit-scrollbar-thumb:hover]:bg-[#b84c2b] dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#e8816a]'

export const LogoIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={cn('block shrink-0 rounded-[10px]', className)}
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

export const IconArrowLeft = ({ className = '' }: { className?: string }) => (
  <svg
    className={cn('shrink-0', className)}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

export const IconArrowRight = ({ className = '' }: { className?: string }) => (
  <svg
    className={cn('shrink-0', className)}
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

export const IconShield = ({ className = '' }: { className?: string }) => (
  <svg
    className={cn('shrink-0', className)}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export const IconCheck = ({ className = '' }: { className?: string }) => (
  <svg
    className={cn('shrink-0', className)}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const IconDoc = ({ className = '' }: { className?: string }) => (
  <svg
    className={cn('shrink-0', className)}
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)


export const IconMail = ({ className = '' }: { className?: string }) => (
  <svg
    className={cn('shrink-0', className)}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

export const BodyP = ({ children }: { children: ReactNode }) => (
  <p className="text-sm leading-[1.75] text-[#6b5f58] dark:text-[#9b9a92]">
    {children}
  </p>
)

export const EmailLink = ({ children }: { children: ReactNode }) => (
  <a
    href={`mailto:${children}`}
    className="font-medium text-[#b84c2b] underline underline-offset-4 hover:text-[#963d22] dark:text-[#e8816a] dark:hover:text-[#f5a090]"
  >
    {children}
  </a>
)

export const Tag = ({
  children,
  variant = 'green',
}: {
  children: ReactNode
  variant?: 'green' | 'amber' | 'rust'
}) => {
  const styles = {
    green:
      'border-[rgba(76,175,125,0.20)] bg-[rgba(76,175,125,0.07)] text-[#4caf7d] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.08)] dark:text-[#5cc98a]',
    amber:
      'border-[rgba(240,165,0,0.22)] bg-[rgba(240,165,0,0.07)] text-[#f0a500] dark:border-[rgba(240,168,66,0.24)] dark:bg-[rgba(240,168,66,0.08)] dark:text-[#f0a842]',
    rust:
      'border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.06em] border',
        styles[variant]
      )}
    >
      {children}
    </span>
  )
}

export const TermsList = ({
  items,
  variant = 'dot',
}: {
  items: ReactNode[]
  variant?: 'dot' | 'check' | 'cross'
}) => {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-start gap-2.5 text-sm leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]"
        >
          {variant === 'check' ? (
            <span className="mt-1 text-[#4caf7d] dark:text-[#5cc98a]">
              <IconCheck />
            </span>
          ) : (
            <span
              className={cn(
                'mt-2.5 h-1.25 w-1.25 shrink-0 rounded-full opacity-70',
                variant === 'cross'
                  ? 'bg-[#d94535] dark:bg-[#ff6b5f]'
                  : 'bg-[#b84c2b] dark:bg-[#e8816a]'
              )}
            />
          )}

          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export const HighlightCard = ({
  label,
  children,
  variant = 'rust',
}: {
  label: string
  children: ReactNode
  variant?: 'rust' | 'green' | 'amber'
}) => {
  const styles = {
    rust:
      'border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.05)] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.07)]',
    green:
      'border-[rgba(76,175,125,0.20)] bg-[rgba(76,175,125,0.07)] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.08)]',
    amber:
      'border-[rgba(240,165,0,0.22)] bg-[rgba(240,165,0,0.07)] dark:border-[rgba(240,168,66,0.24)] dark:bg-[rgba(240,168,66,0.08)]',
  }

  const labelStyles = {
    rust: 'text-[#b84c2b] dark:text-[#e8816a]',
    green: 'text-[#4caf7d] dark:text-[#5cc98a]',
    amber: 'text-[#f0a500] dark:text-[#f0a842]',
  }

  return (
    <div className={cn('rounded-xl border px-5 py-4', styles[variant])}>
      <div
        className={cn(
          'mb-2 font-mono text-[9px] uppercase tracking-[0.12em]',
          labelStyles[variant]
        )}
      >
        {label}
      </div>

      <p className="m-0 text-[13.5px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
        {children}
      </p>
    </div>
  )
}

export const Section = ({
  id,
  num,
  title,
  children,
}: {
  id: string
  num: string
  title: string
  children: ReactNode
}) => {
  return (
    <section
      id={id}
      className="pp-section mb-13 scroll-mt-8"
      aria-labelledby={`title-${id}`}
    >
      <div className="mb-5 flex items-start gap-3.5 border-b border-[rgba(184,76,43,0.10)] pb-3.5 dark:border-[rgba(232,129,106,0.12)]">
        <span className="mt-1 shrink-0 rounded-md border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a]">
          {num}
        </span>

        <h2
          id={`title-${id}`}
          className="font-serif text-[clamp(18px,3vw,24px)] font-bold leading-tight text-[#1a1714] dark:text-[#f2f0eb]"
        >
          {title}
        </h2>
      </div>

      <div className="flex flex-col gap-3.5">{children}</div>
    </section>
  )
}

