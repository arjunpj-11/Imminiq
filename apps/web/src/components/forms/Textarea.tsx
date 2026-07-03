import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'font-ui min-h-28 w-full resize-y rounded-md border border-(--border-subtle) bg-(--surface-elevated) px-3.5 py-3 text-[13px] font-medium leading-6 text-(--text-primary) outline-none transition placeholder:text-(--text-muted) focus:border-(--brand-500) focus:shadow-(--shadow-focus) disabled:cursor-not-allowed disabled:bg-(--surface-muted) disabled:opacity-65',
        className,
      )}
      {...props}
    />
  )
})

export default Textarea
