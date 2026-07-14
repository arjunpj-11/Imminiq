import { forwardRef, type SelectHTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'font-ui h-11 w-full rounded-md border border-(--border-subtle) bg-(--surface-elevated) px-3.5 text-[13px] font-medium text-(--text-primary) outline-none transition focus:border-(--brand-500) focus:shadow-(--shadow-focus) disabled:cursor-not-allowed disabled:bg-(--surface-muted) disabled:opacity-65',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

export default Select;
