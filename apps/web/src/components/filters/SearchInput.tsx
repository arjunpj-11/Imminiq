import type { InputHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'
import Input from '../forms/Input'

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  icon?: ReactNode
  onClear?: () => void
  containerClassName?: string
}

export default function SearchInput({
  icon,
  onClear,
  containerClassName,
  className,
  value,
  ...props
}: SearchInputProps) {
  const hasValue = typeof value === 'string' && value.length > 0

  return (
    <div className={cn('relative min-w-0 flex-1', containerClassName)}>
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b9a92]">
          {icon}
        </span>
      )}
      <Input
        type="search"
        value={value}
        className={cn(Boolean(icon) ? 'pl-10' : undefined, onClear ? 'pr-10' : undefined, className)}
        {...props}
      />
      {onClear && hasValue && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-1.5 py-1 text-[#9b9a92] transition hover:bg-black/5 hover:text-[#b84c2b] dark:hover:bg-white/5 dark:hover:text-[#e8816a]"
        >
          ×
        </button>
      )}
    </div>
  )
}
