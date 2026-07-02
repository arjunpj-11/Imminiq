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
          'text-[19px] font-bold leading-none tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]',
          hideWordmarkOnMobile && 'hidden sm:inline',
          wordmarkClassName,
        )}
      >
        immin
        <span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
        <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
      </span>
    </Link>
  )
}
