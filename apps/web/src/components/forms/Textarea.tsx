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
        'w-full resize-y rounded-[11px] border-[1.5px] border-[#e0d0c5] bg-white px-3.5 py-3 text-[13px] font-medium text-[#1a1714] outline-none transition placeholder:text-[#9f8f86] focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/9 dark:bg-[#252320] dark:text-[#f2f0eb] dark:placeholder:text-[#7a756e] dark:focus:border-[#e8816a]',
        className,
      )}
      {...props}
    />
  )
})

export default Textarea
