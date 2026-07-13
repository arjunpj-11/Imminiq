import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

interface IImminiqWordmarkProps extends HTMLAttributes<HTMLSpanElement> {
  lowercase?: boolean;
  trailingDot?: boolean;
  prefixClassName?: string;
  accentClassName?: string;
}

export default function ImminiqWordmark({
  lowercase = false,
  trailingDot = false,
  className,
  prefixClassName,
  accentClassName,
  ...props
}: IImminiqWordmarkProps) {
  return (
    <span className={cn('inline-flex items-baseline', className)} {...props}>
      <span className={cn('text-(--text-primary) dark:text-[#fff8ed]', prefixClassName)}>
        {lowercase ? 'immin' : 'Immin'}
      </span>
      <span className={cn('text-(--brand-500) dark:text-(--brand-500)', accentClassName)}>
        iq{trailingDot ? '.' : ''}
      </span>
    </span>
  );
}
