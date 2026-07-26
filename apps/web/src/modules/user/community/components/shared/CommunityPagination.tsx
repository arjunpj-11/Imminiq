import Pagination from '../../../../../components/navigation/Pagination';
import type { ICommunityPagination as CommunityPaginationType } from '../../types/community.types';

interface ICommunityPaginationProps {
  pagination: CommunityPaginationType;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function CommunityPagination({
  pagination,
  onPageChange,
  disabled = false,
}: ICommunityPaginationProps) {
  return (
    <Pagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.total}
      onPageChange={onPageChange}
      disabled={disabled}
      showPageNumbers
      className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) px-4 py-3 dark:border-(--border-subtle) dark:bg-(--surface-card)"
    />
  );
}
