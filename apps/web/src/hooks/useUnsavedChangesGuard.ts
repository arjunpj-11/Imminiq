import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface UseUnsavedChangesGuardOptions {
  when: boolean
  onDiscard?: () => void
}

type SaveBeforeLeaveHandler = () => boolean | Promise<boolean>

const currentPath = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`

export function useUnsavedChangesGuard({
  when,
  onDiscard,
}: UseUnsavedChangesGuardOptions) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isBlocked, setIsBlocked] = useState(false)
  const [isSavingChanges, setIsSavingChanges] = useState(false)
  const pendingToRef = useRef<string | null>(null)
  const bypassNextNavigationRef = useRef(false)
  const currentPathRef = useRef(
    `${location.pathname}${location.search}${location.hash}`,
  )

  useEffect(() => {
    currentPathRef.current =
      `${location.pathname}${location.search}${location.hash}`
  }, [location.hash, location.pathname, location.search])

  useEffect(() => {
    if (!when) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [when])

  useEffect(() => {
    if (!when) return

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        bypassNextNavigationRef.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a[href]') as HTMLAnchorElement | null
      if (
        !anchor ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        anchor.getAttribute('aria-disabled') === 'true'
      ) {
        return
      }

      const nextUrl = new URL(anchor.href, window.location.href)
      if (nextUrl.origin !== window.location.origin) return

      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
      if (nextPath === currentPathRef.current) return

      event.preventDefault()
      event.stopPropagation()
      pendingToRef.current = nextPath
      setIsBlocked(true)
    }

    document.addEventListener('click', handleDocumentClick, true)
    return () => document.removeEventListener('click', handleDocumentClick, true)
  }, [when])

  useEffect(() => {
    if (!when) return

    const handlePopState = () => {
      if (bypassNextNavigationRef.current) {
        bypassNextNavigationRef.current = false
        return
      }

      pendingToRef.current = currentPath()
      setIsBlocked(true)
      navigate(currentPathRef.current, { replace: true })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [navigate, when])

  const stayOnPage = useCallback(() => {
    pendingToRef.current = null
    setIsBlocked(false)
  }, [])

  const discardAndLeave = useCallback(() => {
    const pendingTo = pendingToRef.current
    onDiscard?.()
    pendingToRef.current = null
    setIsBlocked(false)

    if (pendingTo) {
      bypassNextNavigationRef.current = true
      navigate(pendingTo)
    }
  }, [navigate, onDiscard])

  const saveChangesAndLeave = useCallback(
    async (onSave: SaveBeforeLeaveHandler) => {
      const pendingTo = pendingToRef.current
      if (!pendingTo || isSavingChanges) return

      setIsSavingChanges(true)
      try {
        const didSave = await onSave()
        if (!didSave) return

        pendingToRef.current = null
        setIsBlocked(false)
        bypassNextNavigationRef.current = true
        navigate(pendingTo)
      } finally {
        setIsSavingChanges(false)
      }
    },
    [isSavingChanges, navigate],
  )

  return {
    isBlocked,
    isSavingChanges,
    stayOnPage,
    discardAndLeave,
    saveChangesAndLeave,
  }
}
