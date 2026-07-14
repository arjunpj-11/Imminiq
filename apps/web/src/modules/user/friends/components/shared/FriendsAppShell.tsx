import type { ReactNode } from 'react';

import { AppShellBoundary } from '../../../../../components/layout/AppShell';

interface IFriendsAppShellProps {
  children: ReactNode;
}

export default function FriendsAppShell({ children }: IFriendsAppShellProps) {
  return <AppShellBoundary>{children}</AppShellBoundary>;
}
