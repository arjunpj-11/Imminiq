import { Link } from 'react-router';

import ImminiqLogo from '../../../../components/ui/ImminiqLogo';
import ImminiqWordmark from '../../../../components/ui/ImminiqWordmark';
import { cn } from '../../../../lib/cn';
import { ROUTES } from '../../../../routes/config/route-paths';

interface ITrackerCreationBrandLinkProps {
  className?: string;
  logoClassName?: string;
  wordmarkClassName?: string;
  hideWordmarkOnMobile?: boolean;
}

export default function TrackerCreationBrandLink({
  className,
  logoClassName,
  wordmarkClassName,
  hideWordmarkOnMobile = false,
}: ITrackerCreationBrandLinkProps) {
  return (
    <Link
      to={ROUTES.dashboard}
      aria-label="Go to dashboard"
      className={cn('inline-flex items-center gap-2.5 leading-none', className)}
    >
      <ImminiqLogo className={cn('h-8 w-8 rounded-lg', logoClassName)} decorative />

      <ImminiqWordmark
        trailingDot
        className={cn(
          'text-[19px] font-bold leading-none tracking-[-0.5px] text-(--text-primary) dark:text-(--text-primary)',
          hideWordmarkOnMobile && 'hidden sm:inline',
          wordmarkClassName
        )}
      />
    </Link>
  );
}
