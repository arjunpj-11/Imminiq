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
      <span
        className={prefixClassName}
        style={{ color: 'var(--imminiq-wordmark-prefix, var(--text-primary))' }}
      >
        {lowercase ? 'immin' : 'Immin'}
      </span>
      <span
        className={accentClassName}
        style={{ color: 'var(--imminiq-wordmark-accent, var(--brand-500))' }}
      >
        iq{trailingDot ? '.' : ''}
      </span>
    </span>
  );
}
