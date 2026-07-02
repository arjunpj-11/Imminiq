import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '../../lib/cn'
import AppNoiseOverlay from '../layout/AppNoiseOverlay'
import ImminiqLogo from '../ui/ImminiqLogo'

interface SystemPageNoiseProps {
  className?: string
}

export function SystemPageNoise({ className }: SystemPageNoiseProps) {
  return <AppNoiseOverlay className={cn('opacity-[0.025]', className)} />
}

interface SystemToastProps {
  message: ReactNode
  visible: boolean
  className?: string
}

export function SystemToast({
  message,
  visible,
  className,
}: SystemToastProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed bottom-7 left-1/2 z-200 -translate-x-1/2 translate-y-5 whitespace-nowrap rounded-full bg-[#1a1714] px-4.5 py-2.5 text-[13px] font-medium text-[#f5ede4] opacity-0 shadow-[0_16px_56px_rgba(0,0,0,0.4)] transition-all duration-300 dark:bg-[#f2f0eb] dark:text-[#141412]',
        visible && 'translate-y-0 opacity-100',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}

interface SystemBrandLinkProps {
  to: string
  className?: string
}

export function SystemBrandLink({ to, className }: SystemBrandLinkProps) {
  return (
    <Link
      className={cn('flex items-center gap-2.5 no-underline', className)}
      to={to}
      aria-label="Go to Imminiq"
    >
      <ImminiqLogo size={30} className="rounded-[9px]" decorative />

      <span className="font-serif text-[22px] font-extrabold leading-none tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
        immin<span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
      </span>
    </Link>
  )
}

interface SystemPageFooterProps {
  onUnavailableLink: (message: string) => void
}

const systemFooterLinks = [
  ['Privacy Policy', 'Privacy page can be linked later.'],
  ['Terms of Service', 'Terms page can be linked later.'],
  ['Academic Integrity', 'Academic Integrity page can be linked later.'],
  ['Contact', 'Contact page can be linked later.'],
] as const

export function SystemPageFooter({
  onUnavailableLink,
}: SystemPageFooterProps) {
  return (
    <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e0d0c5] bg-[rgba(245,237,228,0.92)] px-4 py-4.5 shadow-[0_-1px_0_rgba(253,248,245,0.6)] backdrop-blur-2xl sm:px-8 lg:px-10 dark:border-white/10 dark:bg-[rgba(20,20,18,0.92)] dark:shadow-[0_-1px_0_rgba(30,28,25,0.6)]">
      <div className="font-serif text-base font-extrabold text-[#b84c2b] dark:text-[#e8816a]">
        Imminiq
      </div>

      <div className="flex flex-wrap gap-5">
        {systemFooterLinks.map(([label, message]) => (
          <button
            key={label}
            type="button"
            onClick={() => onUnavailableLink(message)}
            className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#6b5f58]/50 transition hover:text-[#b84c2b] hover:opacity-100 dark:text-[#9b9a92]/50 dark:hover:text-[#e8816a]"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="font-mono text-[8.5px] tracking-[0.06em] text-[#6b5f58]/40 dark:text-[#9b9a92]/40">
        © 2026 Imminiq. Scholarly Rigor, Digital Craft.
      </div>
    </footer>
  )
}

interface SystemPageHeaderProps {
  brandTo: string
  actionTo: string
  actionLabel: string
  actionIcon: ReactNode
  onUnavailableLink: (message: string) => void
  helpMessage?: string
  actionsClassName?: string
}

export function SystemPageHeader({
  brandTo,
  actionTo,
  actionLabel,
  actionIcon,
  onUnavailableLink,
  helpMessage = 'Help page can be linked later.',
  actionsClassName,
}: SystemPageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-13.5 items-center justify-between border-b border-[#e0d0c5] bg-[rgba(245,237,228,0.92)] px-4 shadow-[0_1px_0_rgba(253,248,245,0.6)] backdrop-blur-2xl sm:px-8 lg:px-10 dark:border-white/10 dark:bg-[rgba(20,20,18,0.92)] dark:shadow-[0_1px_0_rgba(30,28,25,0.6)]">
      <SystemBrandLink to={brandTo} />

      <div className={cn('flex items-center gap-2', actionsClassName)}>
        <button
          type="button"
          className="hidden rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#6b5f58] transition hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] sm:block dark:text-[#9b9a92] dark:hover:bg-[rgba(232,129,106,0.1)] dark:hover:text-[#e8816a]"
          onClick={() => onUnavailableLink(helpMessage)}
        >
          Help
        </button>

        <button
          type="button"
          className="hidden rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#6b5f58] transition hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] md:block dark:text-[#9b9a92] dark:hover:bg-[rgba(232,129,106,0.1)] dark:hover:text-[#e8816a]"
          onClick={() =>
            onUnavailableLink('Community guidelines page can be linked later.')
          }
        >
          Community Guidelines
        </button>

        <Link
          to={actionTo}
          className="inline-flex items-center gap-1.5 rounded-[9px] bg-[#1a1714] px-4 py-2 text-xs font-semibold text-[#f5ede4] transition hover:-translate-y-px hover:opacity-85 dark:bg-[#f2f0eb] dark:text-[#141412]"
        >
          {actionIcon}
          {actionLabel}
        </Link>
      </div>
    </header>
  )
}
