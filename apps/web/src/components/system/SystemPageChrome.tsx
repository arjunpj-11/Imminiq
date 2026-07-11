import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '../../lib/cn'
import AppNoiseOverlay from '../layout/AppNoiseOverlay'
import ImminiqLogo from '../ui/ImminiqLogo'
import ImminiqWordmark from '../ui/ImminiqWordmark'

interface ISystemPageNoiseProps {
  className?: string
}

export function SystemPageNoise({ className }: ISystemPageNoiseProps) {
  return <AppNoiseOverlay className={cn('opacity-[0.025]', className)} />
}

interface ISystemToastProps {
  message: ReactNode
  visible: boolean
  className?: string
}

export function SystemToast({
  message,
  visible,
  className,
}: ISystemToastProps) {
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

interface ISystemBrandLinkProps {
  to: string
  className?: string
}

export function SystemBrandLink({ to, className }: ISystemBrandLinkProps) {
  return (
    <Link
      className={cn('flex items-center gap-2.5 no-underline', className)}
      to={to}
      aria-label="Go to Imminiq"
    >
      <ImminiqLogo size={30} className="rounded-sm" decorative />

      <ImminiqWordmark
        lowercase
        className="font-serif text-[22px] font-extrabold leading-none tracking-[-0.5px]"
      />
    </Link>
  )
}

interface ISystemPageFooterProps {
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
}: ISystemPageFooterProps) {
  return (
    <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-(--border-subtle) bg-[rgba(245,237,228,0.92)] px-4 py-4.5 shadow-[0_-1px_0_rgba(253,248,245,0.6)] backdrop-blur-2xl sm:px-8 lg:px-10 dark:border-(--border-subtle) dark:bg-[rgba(20,20,18,0.92)] dark:shadow-[0_-1px_0_rgba(30,28,25,0.6)]">
      <ImminiqWordmark className="font-serif text-base font-extrabold" />

      <div className="flex flex-wrap gap-5">
        {systemFooterLinks.map(([label, message]) => (
          <button
            key={label}
            type="button"
            onClick={() => onUnavailableLink(message)}
            className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-(--text-secondary)/50 transition hover:text-(--brand-500) hover:opacity-100 dark:text-(--text-secondary)/50 dark:hover:text-(--brand-500)"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="font-mono text-[8.5px] tracking-[0.06em] text-(--text-secondary)/40 dark:text-(--text-secondary)/40">
        © 2026 Imminiq. Scholarly Rigor, Digital Craft.
      </div>
    </footer>
  )
}

interface ISystemPageHeaderProps {
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
}: ISystemPageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-13.5 items-center justify-between border-b border-(--border-subtle) bg-[rgba(245,237,228,0.92)] px-4 shadow-[0_1px_0_rgba(253,248,245,0.6)] backdrop-blur-2xl sm:px-8 lg:px-10 dark:border-(--border-subtle) dark:bg-[rgba(20,20,18,0.92)] dark:shadow-[0_1px_0_rgba(30,28,25,0.6)]">
      <SystemBrandLink to={brandTo} />

      <div className={cn('flex items-center gap-2', actionsClassName)}>
        <button
          type="button"
          className="hidden rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-(--text-secondary) transition hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) sm:block dark:text-(--text-secondary) dark:hover:bg-[rgba(232,129,106,0.1)] dark:hover:text-(--brand-500)"
          onClick={() => onUnavailableLink(helpMessage)}
        >
          Help
        </button>

        <button
          type="button"
          className="hidden rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-(--text-secondary) transition hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) md:block dark:text-(--text-secondary) dark:hover:bg-[rgba(232,129,106,0.1)] dark:hover:text-(--brand-500)"
          onClick={() =>
            onUnavailableLink('Community guidelines page can be linked later.')
          }
        >
          Community Guidelines
        </button>

        <Link
          to={actionTo}
          className="inline-flex items-center gap-1.5 rounded-sm bg-[#1a1714] px-4 py-2 text-xs font-semibold text-[#f5ede4] transition hover:-translate-y-px hover:opacity-85 dark:bg-[#f2f0eb] dark:text-[#141412]"
        >
          {actionIcon}
          {actionLabel}
        </Link>
      </div>
    </header>
  )
}
