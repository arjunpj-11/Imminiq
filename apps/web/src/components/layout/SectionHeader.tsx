import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export default function SectionHeader({
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[13px] leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
