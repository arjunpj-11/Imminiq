import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import Input from '../forms/Input';

interface ISearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  icon?: ReactNode;
  onClear?: () => void;
  containerClassName?: string;
}

export default function SearchInput({
  icon,
  onClear,
  containerClassName,
  className,
  value,
  ...props
}: ISearchInputProps) {
  const hasIcon = icon !== null && icon !== undefined;
  const hasValue = typeof value === 'string' && value.length > 0;

  return (
    <div className={cn('relative min-w-0 flex-1', containerClassName)}>
      {hasIcon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b9a92]">
          {icon}
        </span>
      )}

      <Input
        {...props}
        type="search"
        value={value}
        className={cn(hasIcon && 'pl-10', onClear && 'pr-10', className)}
      />

      {onClear && hasValue && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-1.5 py-1 text-[#9b9a92] transition hover:bg-black/5 hover:text-(--brand-500) dark:hover:bg-white/5 dark:hover:text-(--brand-500)"
        >
          ×
        </button>
      )}
    </div>
  );
}
