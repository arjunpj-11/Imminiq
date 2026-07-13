import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import api from '../../lib/axios'
import { cn } from '../../lib/cn'
import { useAuthStore } from '../../store/useAuthStore'
import { useAppShellStore } from '../../store/useAppShellStore'
import ImminiqLogo from '../ui/ImminiqLogo'
import ImminiqWordmark from '../ui/ImminiqWordmark'
import ConfirmDialog from '../overlays/ConfirmDialog'

interface ITopBarProps {
  onMenuClick?: () => void
  streakDays?: number
  userName?: string
  userInitials?: string
  userAvatarUrl?: string
  userLevel?: string
  isGuest?: boolean
  notificationCount?: number
  messageCount?: number
  friendRequestCount?: number
}

const routeLabels: Array<[RegExp, string]> = [
  [/^\/dashboard/, 'Dashboard'],
  [/^\/trackers\/[^/]+\/lessons/, 'Lesson'],
  [/^\/trackers\/[^/]+\/roadmap/, 'Roadmap'],
  [/^\/trackers\/[^/]+\/manage/, 'Manage tracker'],
  [/^\/trackers/, 'Trackers'],
  [/^\/mock-tests\/attempts\/.+\/analysis/, 'Test analysis'],
  [/^\/mock-tests\/attempts\/.+\/result/, 'Test result'],
  [/^\/mock-tests/, 'Mock tests'],
  [/^\/learning-agent/, 'Learning agent'],
  [/^\/community/, 'Community'],
  [/^\/leaderboard/, 'Leaderboard'],
  [/^\/activity/, 'Activity'],
  [/^\/friends\/search/, 'Find people'],
  [/^\/friends/, 'Friends'],
  [/^\/settings/, 'Settings'],
  [/^\/profile/, 'Profile'],
]

const iconClass =
  'relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] shadow-[var(--shadow-1)] transition hover:border-[color-mix(in_srgb,var(--brand-500)_30%,var(--border-subtle))] hover:text-[var(--brand-500)] focus-visible:outline-none'

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
)

const MessageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

const FriendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
)

const CountBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null
  return (
    <span className="absolute -right-1.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full border-2 border-(--surface-canvas) bg-(--brand-500) px-1 font-mono text-[8px] font-bold leading-none text-(--brand-contrast)">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function TopBar({
  streakDays = 0,
  userName = 'Imminiq User',
  userInitials = 'IM',
  userAvatarUrl,
  userLevel = 'Free Scholar',
  isGuest = false,
  notificationCount = 0,
  messageCount = 0,
  friendRequestCount = 0,
}: ITopBarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [profileOpen, setProfileOpen] = useState(false)
  const [streakOpen, setStreakOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const streakRef = useRef<HTMLDivElement>(null)

  const pageLabel = useMemo(
    () => routeLabels.find(([pattern]) => pattern.test(location.pathname))?.[1] ?? 'Imminiq',
    [location.pathname],
  )

  const nextMilestone = streakDays < 7 ? 7 : streakDays < 14 ? 14 : streakDays < 30 ? 30 : Math.ceil((streakDays + 1) / 10) * 10
  const milestoneBase = streakDays < 7 ? 0 : streakDays < 14 ? 7 : streakDays < 30 ? 14 : Math.floor(streakDays / 10) * 10
  const milestoneProgress = Math.max(0, Math.min(100, ((streakDays - milestoneBase) / Math.max(1, nextMilestone - milestoneBase)) * 100))
  const commandShortcutLabel = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'
  const openCommandPalette = useAppShellStore((state) => state.openCommandPalette)

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false)
      if (streakRef.current && !streakRef.current.contains(target)) setStreakOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    return () => document.removeEventListener('mousedown', handlePointer)
  }, [])


  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    setProfileOpen(false)
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
      setIsSigningOut(false)
    }
  }

  const requestSignOut = () => {
    setProfileOpen(false)
    setSignOutConfirmOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-(--topbar-height) items-center gap-4 border-b border-(--border-subtle) bg-[color-mix(in_srgb,var(--surface-canvas)_90%,transparent)] px-6 backdrop-blur-xl max-[640px]:gap-2.5 max-[640px]:px-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={isGuest ? '/' : '/dashboard'}
            aria-label={isGuest ? 'Go to Imminiq home' : 'Go to dashboard'}
            className="flex shrink-0 items-center gap-2 rounded-md no-underline"
          >
            <ImminiqLogo size={30} className="rounded-sm" decorative />
            <ImminiqWordmark className="hidden text-[17px] font-[760] tracking-[-0.035em] min-[1120px]:inline-flex" />
          </Link>
          {!isGuest && (
            <>
              <span className="hidden h-5 w-px bg-(--border-subtle) sm:block" aria-hidden="true" />
              <span className="truncate text-[13px] font-[660] text-(--text-primary) max-[430px]:max-w-28">
                {pageLabel}
              </span>
            </>
          )}
        </div>

        {!isGuest && (
          <button
            type="button"
            onClick={openCommandPalette}
            className="mx-auto hidden h-9 w-full max-w-md items-center gap-2.5 rounded-md border border-(--border-subtle) bg-(--surface-elevated) px-3.5 text-left text-[12px] text-(--text-muted) shadow-(--shadow-1) transition hover:border-[color-mix(in_srgb,var(--brand-500)_28%,var(--border-subtle))] hover:text-(--text-secondary) md:flex"
            aria-label="Open command palette"
          >
            <SearchIcon />
            <span className="min-w-0 flex-1 truncate">Search pages and actions</span>
            <kbd className="rounded-sm bg-(--surface-muted) px-1.5 py-0.5 font-mono text-[9px]">{commandShortcutLabel}</kbd>
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isGuest ? (
            <>
              <Link to="/login" className="rounded-sm px-3 py-2 text-[12px] font-semibold text-(--text-secondary) no-underline hover:text-(--brand-500)">
                Sign in
              </Link>
              <Link to="/register" className="rounded-md bg-(--brand-500) px-3.5 py-2 text-[12px] font-bold text-(--brand-contrast) no-underline transition hover:bg-(--brand-600)">
                Join
              </Link>
            </>
          ) : (
            <>
              <button type="button" onClick={openCommandPalette} className={cn(iconClass, 'md:hidden')} aria-label="Open search and commands">
                <SearchIcon />
              </button>

              <div className="relative" ref={streakRef}>
                <button
                  type="button"
                  onClick={() => setStreakOpen((open) => !open)}
                  aria-expanded={streakOpen}
                  aria-haspopup="dialog"
                  className="flex h-9 items-center gap-1.5 rounded-md border border-[color-mix(in_srgb,var(--brand-500)_22%,var(--border-subtle))] bg-[color-mix(in_srgb,var(--brand-500)_8%,var(--surface-elevated))] px-2.5 font-mono text-[10px] font-bold text-(--brand-500) transition hover:bg-[color-mix(in_srgb,var(--brand-500)_13%,var(--surface-elevated))]"
                >
                  <span aria-hidden="true">🔥</span>
                  <span>{streakDays}</span>
                  <span className="hidden sm:inline">day</span>
                </button>
                {streakOpen && (
                  <div role="dialog" aria-label="Streak details" className="route-enter absolute right-0 top-[calc(100%+10px)] z-50 w-72 rounded-lg border border-(--border-subtle) bg-(--surface-elevated) p-4 shadow-(--shadow-2)">
                    <div className="type-label-sm text-(--brand-500)">Current streak</div>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="type-metric-xl">{streakDays}</span>
                      <span className="pb-1 text-[12px] text-(--text-secondary)">days in a row</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] text-(--text-secondary)">
                      <span>Next milestone</span>
                      <span className="font-mono font-semibold text-(--text-primary)">{nextMilestone} days</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--surface-muted)">
                      <div className="h-full rounded-full bg-(--brand-500) transition-[width] duration-500" style={{ width: `${milestoneProgress}%` }} />
                    </div>
                    <Link to="/activity" onClick={() => setStreakOpen(false)} className="mt-4 block text-[12px] font-semibold text-(--brand-500) no-underline hover:underline">
                      View activity history →
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/friends" className={cn(iconClass, 'max-[520px]:hidden')} aria-label={friendRequestCount ? `${friendRequestCount} pending friend requests` : 'Open friends'}>
                <FriendIcon /><CountBadge count={friendRequestCount} />
              </Link>
              <Link to="/chats" className={cn(iconClass, 'max-[760px]:hidden')} aria-label={messageCount ? `${messageCount} unread messages` : 'Open messages'}>
                <MessageIcon /><CountBadge count={messageCount} />
              </Link>
              <Link to="/notifications" className={cn(iconClass, 'max-[640px]:hidden')} aria-label={notificationCount ? `${notificationCount} unread notifications` : 'Open notifications'}>
                <BellIcon /><CountBadge count={notificationCount} />
              </Link>

              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-label="Open user menu"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 bg-linear-to-br from-(--brand-500) to-[#e9a08e] text-[11px] font-bold text-white transition focus-visible:outline-none',
                    profileOpen ? 'border-(--brand-500) shadow-(--shadow-focus)' : 'border-(--surface-elevated) hover:shadow-(--shadow-focus)',
                  )}
                >
                  {userAvatarUrl ? <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" /> : userInitials}
                </button>

                {profileOpen && (
                  <div role="menu" className="route-enter absolute right-0 top-[calc(100%+10px)] z-50 w-60 overflow-hidden rounded-lg border border-(--border-subtle) bg-(--surface-elevated) shadow-(--shadow-2)">
                    <div className="border-b border-(--border-subtle) p-3.5">
                      <div className="truncate text-[13px] font-[680] text-(--text-primary)">{userName}</div>
                      <div className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.08em] text-(--text-muted)">{userLevel}</div>
                    </div>
                    <div className="p-1.5">
                      {[
                        ['/profile', 'Profile'],
                        ['/activity', 'Activity'],
                        ['/settings/preferences', 'Preferences'],
                        ['/settings/security', 'Account security'],
                        ['/support', 'Raise a support ticket'],
                      ].map(([to, label]) => (
                        <Link key={to} to={to} role="menuitem" onClick={() => setProfileOpen(false)} className="block rounded-sm px-3 py-2.5 text-[12px] font-medium text-(--text-secondary) no-underline transition hover:bg-(--surface-muted) hover:text-(--text-primary)">
                          {label}
                        </Link>
                      ))}
                      <div className="my-1 h-px bg-(--border-subtle)" />
                      <button type="button" role="menuitem" onClick={requestSignOut} disabled={isSigningOut} className="w-full rounded-sm px-3 py-2.5 text-left text-[12px] font-semibold text-(--danger) transition hover:bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] disabled:opacity-60">
                        {isSigningOut ? 'Signing out…' : 'Sign out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>
      <ConfirmDialog
        open={signOutConfirmOpen}
        title="Sign out of Imminiq?"
        description="Are you sure you want to sign out? You’ll need to sign in again to continue learning."
        confirmText="Sign out"
        isLoading={isSigningOut}
        onConfirm={() => { void handleSignOut() }}
        onClose={() => {
          if (!isSigningOut) setSignOutConfirmOpen(false)
        }}
      />
    </>
  )
}
