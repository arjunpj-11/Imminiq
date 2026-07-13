import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const routeNames: Array<[RegExp, string]> = [
  [/^\/dashboard/, 'Dashboard'],
  [/^\/trackers\/[^/]+\/lessons/, 'Lesson'],
  [/^\/trackers\/[^/]+\/roadmap/, 'Tracker roadmap'],
  [/^\/trackers/, 'Trackers'],
  [/^\/mock-tests/, 'Mock tests'],
  [/^\/learning-agent/, 'Learning agent'],
  [/^\/community/, 'Community'],
  [/^\/leaderboard/, 'Leaderboard'],
  [/^\/activity/, 'Activity'],
  [/^\/friends/, 'Friends'],
  [/^\/settings/, 'Settings'],
  [/^\/profile/, 'Profile'],
]

const getRouteName = (pathname: string) =>
  routeNames.find(([pattern]) => pattern.test(pathname))?.[1] ?? 'Imminiq'

const positions = new Map<string, number>()

export default function RouteExperience() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const previousPath = useRef(location.pathname)

  const routeName = getRouteName(location.pathname)
  const announcement = `${routeName} page loaded`

  useEffect(() => {
    document.title =
      routeName === 'Imminiq' ? 'Imminiq' : `${routeName} · Imminiq`
  }, [routeName])

  useEffect(() => {
    const oldPath = previousPath.current

    if (oldPath === location.pathname) {
      return
    }

    positions.set(oldPath, window.scrollY)
    previousPath.current = location.pathname

    const frameId = window.requestAnimationFrame(() => {
      const nextScrollPosition =
        navigationType === 'POP'
          ? (positions.get(location.pathname) ?? 0)
          : 0

      window.scrollTo({
        top: nextScrollPosition,
        behavior: 'auto',
      })
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [location.pathname, navigationType])

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  )
}
