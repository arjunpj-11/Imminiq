import type { HTMLAttributes } from 'react';

import { PRODUCT_LANGUAGE } from '../../config/product-language';
import { cn } from '../../lib/cn';

interface IImminiqWordmarkProps extends HTMLAttributes<HTMLSpanElement> {
  trailingDot?: boolean;
  prefixClassName?: string;
  accentClassName?: string;
}

export default function ImminiqWordmark({
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
        {PRODUCT_LANGUAGE.brand.slice(0, -2)}
      </span>
      <span
        className={accentClassName}
        style={{ color: 'var(--imminiq-wordmark-accent, var(--brand-500))' }}
      >
        {PRODUCT_LANGUAGE.brand.slice(-2)}
        {trailingDot ? '.' : ''}
      </span>
    </span>
  );
}
