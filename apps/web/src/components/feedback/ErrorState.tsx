import { AlertTriangle, ShieldX, WifiOff, Wrench } from 'lucide-react';
import type { ReactNode } from 'react';

import { getUserFacingError } from '../../lib/user-facing-error';
import Button from '../ui/Button';
import EmptyState from './EmptyState';

type ErrorStateKind = 'error' | 'offline' | 'maintenance' | 'permission';

interface IErrorStateProps {
  title?: ReactNode;
  description?: ReactNode;
  error?: unknown;
  kind?: ErrorStateKind;
  onRetry?: () => void;
  action?: ReactNode;
}

const stateDefaults: Record<
  ErrorStateKind,
  { title: string; description: string; icon: ReactNode }
> = {
  error: {
    title: "We couldn't load this view",
    description: 'Your information is safe. Try again to reconnect to the latest data.',
    icon: <AlertTriangle size={22} aria-hidden="true" />,
  },
  offline: {
    title: "You're offline",
    description: 'Reconnect to the internet, then try again.',
    icon: <WifiOff size={22} aria-hidden="true" />,
  },
  maintenance: {
    title: 'Temporarily unavailable',
    description: 'This area is paused for maintenance. Please check again shortly.',
    icon: <Wrench size={22} aria-hidden="true" />,
  },
  permission: {
    title: 'Access unavailable',
    description: 'Your account does not have permission to view this area.',
    icon: <ShieldX size={22} aria-hidden="true" />,
  },
};

export default function ErrorState({
  title,
  description,
  error,
  kind = 'error',
  onRetry,
  action,
}: IErrorStateProps) {
  const defaults = stateDefaults[kind];

  return (
    <EmptyState
      role="alert"
      icon={defaults.icon}
      title={title ?? defaults.title}
      description={
        description ??
        (error ? getUserFacingError(error, defaults.description) : defaults.description)
      }
      action={action ?? (onRetry ? <Button onClick={onRetry}>Try again</Button> : undefined)}
    />
  );
}
