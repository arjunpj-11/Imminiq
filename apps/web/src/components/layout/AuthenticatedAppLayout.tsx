import { Outlet, useLocation } from 'react-router-dom'

import AppErrorBoundary from '../system/AppErrorBoundary'
import { AppShell } from './AppShell'

export default function AuthenticatedAppLayout() {
  const location = useLocation()

  return (
    <AppShell>
      <AppErrorBoundary resetKey={location.pathname}>
        <div key={location.pathname} className="route-enter min-w-0">
          <Outlet />
        </div>
      </AppErrorBoundary>
    </AppShell>
  )
}
