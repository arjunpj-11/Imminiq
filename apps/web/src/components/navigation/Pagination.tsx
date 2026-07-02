import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
  className?: string
  totalItems?: number
  summary?: ReactNode
  showPageNumbers?: boolean
  maxVisiblePages?: number
  previousLabel?: ReactNode
  nextLabel?: ReactNode
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

function getPageItems(
  page: number,
  totalPages: number,
  maxVisiblePages: number,
): PageItem[] {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const innerSlots = Math.max(1, maxVisiblePages - 2)
  const half = Math.floor(innerSlots / 2)
  let start = Math.max(2, page - half)
  let end = Math.min(totalPages - 1, start + innerSlots - 1)

  if (end - start + 1 < innerSlots) {
    start = Math.max(2, end - innerSlots + 1)
  }

  const items: PageItem[] = [1]

  if (start > 2) items.push('ellipsis-start')
  for (let current = start; current <= end; current += 1) {
    items.push(current)
  }
  if (end < totalPages - 1) items.push('ellipsis-end')

  items.push(totalPages)
  return items
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className,
  totalItems,
  summary,
  showPageNumbers = false,
  maxVisiblePages = 5,
  previousLabel = 'Previous',
  nextLabel = 'Next',
}: PaginationProps) {
  if (totalPages <= 1) return null

  const safePage = Math.min(Math.max(page, 1), totalPages)
  const pageItems = showPageNumbers
    ? getPageItems(safePage, totalPages, Math.max(3, maxVisiblePages))
    : []

  return (
    <nav
      className={cn(
        'flex flex-wrap items-center justify-center gap-2',
        Boolean(summary) || totalItems !== undefined ? 'justify-between' : undefined,
        className,
      )}
      aria-label="Pagination"
    >
      {(summary || totalItems !== undefined) && (
        <div className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-widest text-[#9b9a92]">
          {summary ?? (
            <>
              Page {safePage} of {totalPages}
              {totalItems !== undefined ? ` · ${totalItems} total` : ''}
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <PaginationButton
          disabled={disabled || safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          {previousLabel}
        </PaginationButton>

        {showPageNumbers ? (
          pageItems.map((item) =>
            typeof item === 'number' ? (
              <PaginationButton
                key={item}
                active={item === safePage}
                disabled={disabled}
                onClick={() => onPageChange(item)}
                aria-label={`Go to page ${item}`}
                aria-current={item === safePage ? 'page' : undefined}
                square
              >
                {item}
              </PaginationButton>
            ) : (
              <span
                key={item}
                className="px-1 font-['DM_Mono',monospace] text-[10px] text-[#9b9a92]"
                aria-hidden="true"
              >
                …
              </span>
            ),
          )
        ) : (
          <span className="min-w-20 text-center font-['DM_Mono',monospace] text-[10px] text-[#6b5f58] dark:text-[#9b9a92]">
            {safePage} / {totalPages}
          </span>
        )}

        <PaginationButton
          disabled={disabled || safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          {nextLabel}
        </PaginationButton>
      </div>
    </nav>
  )
}

interface PaginationButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  square?: boolean
}

function PaginationButton({
  active = false,
  square = false,
  className,
  children,
  type = 'button',
  ...props
}: PaginationButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-[9px] border px-3 font-["DM_Mono",monospace] text-[10px] font-bold uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(184,76,43,0.22)] disabled:cursor-not-allowed disabled:opacity-40',
        square && 'min-w-9 px-2',
        active
          ? 'border-[#b84c2b] bg-[#b84c2b] text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] dark:border-[#e8816a] dark:bg-[#e8816a] dark:text-[#141412]'
          : 'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] hover:border-[#b84c2b] hover:text-[#b84c2b] dark:border-white/10 dark:bg-[#1c1a18] dark:text-[#9b9a92] dark:hover:border-[#e8816a] dark:hover:text-[#e8816a]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
