import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, 'aria-invalid': ariaInvalid, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={ariaInvalid}
      className={cn(
        'font-ui h-11 w-full rounded-md border border-(--border-subtle) bg-(--surface-elevated) px-3.5 text-[13px] font-medium text-(--text-primary) shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-(--text-muted) focus:border-(--brand-500) focus:shadow-(--shadow-focus) disabled:cursor-not-allowed disabled:bg-(--surface-muted) disabled:opacity-65 aria-invalid:border-(--danger) aria-invalid:shadow-[0_0_0_3px_color-mix(in_srgb,var(--danger)_16%,transparent)]',
        className
      )}
      {...props}
    />
  );
});

export default Input;
