import type { CommunityPagination as CommunityPaginationType } from '../types/community.types'

interface CommunityPaginationProps {
  pagination: CommunityPaginationType
  onPageChange: (page: number) => void
}

export default function CommunityPagination({
  pagination,
  onPageChange,
}: CommunityPaginationProps) {
  if (pagination.totalPages <= 1) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3 dark:border-white/9 dark:bg-[#1e1c19]">
      <span className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-widest text-[#9b9a92]">
        Page {pagination.page} of {pagination.totalPages} · {pagination.total}{' '}
        total
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
          className="rounded-lg border border-[#e0d0c5] px-3 py-1.5 text-[12px] font-bold text-[#6b5f58] transition hover:border-[rgba(184,76,43,0.28)] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
          className="rounded-lg border border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.07)] px-3 py-1.5 text-[12px] font-bold text-[#b84c2b] transition hover:border-[rgba(184,76,43,0.35)] hover:bg-[rgba(184,76,43,0.12)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]"
        >
          Next
        </button>
      </div>
    </div>
  )
}
