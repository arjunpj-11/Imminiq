import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  findNavigationCommandByShortcut,
  NAVIGATION_COMMANDS,
} from '../../lib/navigation-commands'
import { useAppShellStore } from '../../store/useAppShellStore'
import CommandPalette from '../overlays/CommandPalette'

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false

  return (
    target.isContentEditable ||
    target.matches('input, textarea, select, [role="textbox"]') ||
    Boolean(target.closest('[contenteditable="true"], [role="textbox"]'))
  )
}

/**
 * Owns global authenticated navigation shortcuts and the command palette.
 * It is mounted above both the normal app shell and focused lesson/test routes,
 * so shortcuts keep working even when the regular top bar is intentionally hidden.
 */
export default function GlobalNavigationController() {
  const navigate = useNavigate()
  const commandPaletteOpen = useAppShellStore(
    (state) => state.commandPaletteOpen,
  )
  const closeCommandPalette = useAppShellStore(
    (state) => state.closeCommandPalette,
  )
  const toggleCommandPalette = useAppShellStore(
    (state) => state.toggleCommandPalette,
  )
  const navigationChordRef = useRef<string | null>(null)
  const navigationChordTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const clearNavigationChord = () => {
      navigationChordRef.current = null
      if (navigationChordTimerRef.current !== null) {
        window.clearTimeout(navigationChordTimerRef.current)
        navigationChordTimerRef.current = null
      }
    }

    const handleShortcut = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()

      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        if (isEditableTarget(event.target) && !commandPaletteOpen) return
        event.preventDefault()
        clearNavigationChord()
        toggleCommandPalette()
        return
      }

      if (
        commandPaletteOpen ||
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableTarget(event.target)
      ) {
        clearNavigationChord()
        return
      }

      // Avoid navigating away while another modal is active.
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
        clearNavigationChord()
        return
      }

      const pendingPrefix = navigationChordRef.current
      if (pendingPrefix) {
        const command = findNavigationCommandByShortcut(pendingPrefix, key)
        clearNavigationChord()
        if (command) {
          event.preventDefault()
          navigate(command.path)
        }
        return
      }

      const startsShortcut = NAVIGATION_COMMANDS.some(
        (command) => command.shortcut?.[0].toLowerCase() === key,
      )
      if (!startsShortcut) return

      event.preventDefault()
      navigationChordRef.current = key
      navigationChordTimerRef.current = window.setTimeout(
        clearNavigationChord,
        1_200,
      )
    }

    window.addEventListener('keydown', handleShortcut)
    return () => {
      clearNavigationChord()
      window.removeEventListener('keydown', handleShortcut)
    }
  }, [commandPaletteOpen, navigate, toggleCommandPalette])

  return (
    <CommandPalette
      open={commandPaletteOpen}
      onClose={closeCommandPalette}
    />
  )
}
