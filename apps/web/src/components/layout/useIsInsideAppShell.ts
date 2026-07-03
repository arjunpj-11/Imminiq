import { useContext } from 'react'

import { AppShellContext } from './AppShellContext'

export const useIsInsideAppShell = () =>
  useContext(AppShellContext) !== null