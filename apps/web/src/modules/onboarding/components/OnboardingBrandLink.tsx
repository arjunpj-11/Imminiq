import { Link } from 'react-router-dom'

import { cn } from '../../../lib/cn'
import { OnboardingLogoIcon } from './OnboardingLogoIcon'

interface OnboardingBrandLinkProps {
  className?: string
  logoClassName?: string
  wordmarkClassName?: string
  hideWordmarkOnMobile?: boolean
}

export default function OnboardingBrandLink({
  className,
  logoClassName,
  wordmarkClassName,
  hideWordmarkOnMobile = false,
}: OnboardingBrandLinkProps) {
  return (
    <Link
      to="/"
      aria-label="Go to home page"
      className={cn('inline-flex items-center gap-2.5 leading-none', className)}
    >
      <OnboardingLogoIcon
        className={cn('h-8 w-8 rounded-lg', logoClassName)}
        decorative
      />

      <span
        className={cn(
          'text-[19px] font-bold leading-none tracking-[-0.5px] text-(--text-primary) dark:text-(--text-primary)',
          hideWordmarkOnMobile && 'hidden sm:inline',
          wordmarkClassName,
        )}
      >
        immin
        <span className="text-(--brand-500) dark:text-(--brand-500)">iq</span>
        <span className="text-(--brand-500) dark:text-(--brand-500)">.</span>
      </span>
    </Link>
  )
}
