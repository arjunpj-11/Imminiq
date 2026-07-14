import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

interface IPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  totalItems?: number;
  summary?: ReactNode;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  previousLabel?: ReactNode;
  nextLabel?: ReactNode;
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

function getPageItems(page: number, totalPages: number, maxVisiblePages: number): PageItem[] {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const innerSlots = Math.max(1, maxVisiblePages - 2);
  const half = Math.floor(innerSlots / 2);

  let start = Math.max(2, page - half);
  const end = Math.min(totalPages - 1, start + innerSlots - 1);

  if (end - start + 1 < innerSlots) {
    start = Math.max(2, end - innerSlots + 1);
  }

  const items: PageItem[] = [1];

  if (start > 2) {
    items.push('ellipsis-start');
  }

  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }

  if (end < totalPages - 1) {
    items.push('ellipsis-end');
  }

  items.push(totalPages);

  return items;
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
}: IPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pageItems = showPageNumbers
    ? getPageItems(safePage, totalPages, Math.max(3, maxVisiblePages))
    : [];

  const hasSummary = Boolean(summary) || totalItems !== undefined;

  return (
    <nav
      className={cn(
        'flex flex-wrap items-center justify-center gap-2',
        hasSummary && 'justify-between',
        className
      )}
      aria-label="Pagination"
    >
      {hasSummary && (
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#9b9a92]">
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
                className="px-1 font-mono text-[10px] text-[#9b9a92]"
                aria-hidden="true"
              >
                …
              </span>
            )
          )
        ) : (
          <span className="min-w-20 text-center font-mono text-[10px] text-(--text-secondary)">
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
  );
}

interface IPaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  square?: boolean;
}

function PaginationButton({
  active = false,
  square = false,
  className,
  children,
  type = 'button',
  ...props
}: IPaginationButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-sm border px-3 font-mono text-[10px] font-bold uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(184,76,43,0.22)] disabled:cursor-not-allowed disabled:opacity-40',
        square && 'min-w-9 px-2',
        active
          ? 'border-(--brand-500) bg-(--brand-500) text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] dark:border-(--brand-500) dark:bg-(--brand-500) dark:text-[#141412]'
          : 'border-(--border-subtle) bg-(--surface-card) text-(--text-secondary) hover:border-(--brand-500) hover:text-(--brand-500) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary) dark:hover:border-(--brand-500) dark:hover:text-(--brand-500)',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
