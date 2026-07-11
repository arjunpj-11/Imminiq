import type { ReactNode } from 'react'

import Button from '../ui/Button'
import EmptyState from './EmptyState'

interface IErrorStateProps {
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
}: IErrorStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        action ??
        (onRetry ? <Button onClick={onRetry}>Try again</Button> : undefined)
      }
    />
  )
}
