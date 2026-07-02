import { useLayoutEffect } from 'react'

import NetworkRedirector from './components/system/NetworkRedirector'
import AppRoutes from './routes/AppRoutes'
import AuthSessionBridge from './routes/AuthSessionBridge'
import { useThemeStore } from './store/useThemeStore'

export default function App() {
  const initTheme = useThemeStore((state) => state.initTheme)

  useLayoutEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <>
      <NetworkRedirector />
      <AuthSessionBridge />
      <AppRoutes />
    </>
  )
}
