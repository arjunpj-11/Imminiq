import { Outlet } from 'react-router-dom'

import { AppShell } from './AppShell'

export default function AuthenticatedAppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
