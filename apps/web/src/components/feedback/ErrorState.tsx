import type { ReactNode } from 'react'

import EmptyState from './EmptyState'

interface ErrorStateProps {
  title?: ReactNode
  description?: ReactNode
  onRetry?: () => void
  action?: ReactNode
}

export default function ErrorState({
  title = 'Something went wrong',
  description = 'The content could not be loaded. Please try again.',
  onRetry,
  action,
}: ErrorStateProps) {
  const retryAction = onRetry ? (
    <button
      type="button"
      onClick={onRetry}
      className="rounded-[10px] bg-[#b84c2b] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412]"
    >
      Try again
    </button>
  ) : null

  return (
    <EmptyState
      title={title}
      description={description}
      action={action ?? retryAction}
    />
  )
}
