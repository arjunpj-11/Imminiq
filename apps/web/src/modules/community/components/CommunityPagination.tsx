import Pagination from '../../../components/navigation/Pagination'
import type { CommunityPagination as CommunityPaginationType } from '../types/community.types'

interface CommunityPaginationProps {
  pagination: CommunityPaginationType
  onPageChange: (page: number) => void
}

export default function CommunityPagination({
  pagination,
  onPageChange,
}: CommunityPaginationProps) {
  return (
    <Pagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.total}
      onPageChange={onPageChange}
      className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3 dark:border-white/9 dark:bg-[#1e1c19]"
    />
  )
}
