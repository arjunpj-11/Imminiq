import { cn } from '../../lib/cn'

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import api from '../../lib/axios'
import { useAuthStore } from '../../store/useAuthStore'
import ImminiqLogo from '../ui/ImminiqLogo'

interface TopBarProps {
  /**
   * Kept for compatibility with existing ProfilePage calls.
   * The topbar no longer renders a mobile sidebar toggle because
   * the bottom navigation is the mobile navigation surface.
   */
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

const BellIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
)

const MessageIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

const FriendIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
)

const CountBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null

  return (
    <span className="absolute -right-1.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#f5ede4] bg-[#b84c2b] px-1 text-[8px] font-bold leading-none text-white shadow-[0_4px_12px_rgba(184,76,43,0.30)] dark:border-[#141412] dark:bg-[#e8816a] dark:text-[#141412]">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function TopBar({
  streakDays = 42,
  userName = 'Arjun Kumar',
  userInitials = 'AK',
  userAvatarUrl,
  userLevel = 'Level 12 · Adept',
  isGuest = false,
  notificationCount = 0,
  messageCount = 0,
  friendRequestCount = 0,
}: TopBarProps) {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const [ddOpen, setDdOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const ddRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(event.target as Node)) {
        setDdOpen(false)
      }
    }

    document.addEventListener('click', handler)

    return () => {
      document.removeEventListener('click', handler)
    }
  }, [])

  const handleSignOut = async () => {
    if (isSigningOut) return

    setIsSigningOut(true)
    setDdOpen(false)

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

  return (
    <header className="sticky top-0 z-20 flex h-13.5 items-center justify-between border-b border-[#e0d0c5] bg-[rgba(245,237,228,0.92)] px-7 shadow-[0_1px_0_rgba(253,248,245,0.6)] backdrop-blur-xl saturate-[1.4] dark:border-white/9 dark:bg-[rgba(20,20,18,0.92)] max-[640px]:px-4">
      <Link
        to={isGuest ? '/' : '/dashboard'}
        aria-label={isGuest ? 'Go to Imminiq home' : 'Go to Imminiq dashboard'}
        className="flex min-w-0 items-center gap-2.5 rounded-[10px] no-underline transition hover:opacity-90"
      >
        <ImminiqLogo size={30} className="rounded-[9px]" decorative />

        <span className="truncate font-['Playfair_Display',serif] text-[20px] font-extrabold leading-none tracking-[-0.45px] text-[#b84c2b] dark:text-[#e8816a] max-[420px]:text-[18px]">
          Imminiq
        </span>
      </Link>

      <div className="flex items-center gap-2.5">
        {isGuest ? (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-[9px] border-[1.5px] border-[#e0d0c5] px-3 py-1.75 text-[12px] font-semibold text-[#6b5f58] no-underline transition hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a] max-[420px]:px-2.5"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="rounded-[9px] bg-[#b84c2b] px-3.5 py-2 text-[12px] font-bold text-[#fdf8f5] no-underline transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a] max-[420px]:px-3"
            >
              Join
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden items-center gap-1.25 whitespace-nowrap rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.75 py-1.25 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a] sm:inline-flex">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="animate-pulse"
                aria-hidden="true"
              >
                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
              </svg>
              {streakDays}-Day Streak
            </div>

            <Link
              to="/friends"
              aria-label={
                friendRequestCount > 0
                  ? `${friendRequestCount} pending friend requests`
                  : 'Open friends'
              }
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border-[1.5px] border-[#e0d0c5] text-[#6b5f58] no-underline transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
            >
              <FriendIcon />
              <CountBadge count={friendRequestCount} />
            </Link>

            <Link
              to="/chats"
              aria-label={
                messageCount > 0
                  ? `${messageCount} unread messages`
                  : 'Open messages'
              }
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border-[1.5px] border-[#e0d0c5] text-[#6b5f58] no-underline transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
            >
              <MessageIcon />
              <CountBadge count={messageCount} />
            </Link>

            <Link
              to="/notifications"
              aria-label={
                notificationCount > 0
                  ? `${notificationCount} unread notifications`
                  : 'Open notifications'
              }
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border-[1.5px] border-[#e0d0c5] text-[#6b5f58] no-underline transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
            >
              <BellIcon />
              <CountBadge count={notificationCount} />
            </Link>

            <div className="relative" ref={ddRef}>
              <button
                type="button"
                onClick={() => setDdOpen((value) => !value)}
                aria-label="User menu"
                aria-haspopup="true"
                aria-expanded={ddOpen}
                className={cn(
                  'flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 bg-linear-to-br from-[#b84c2b] to-[#e8816a] text-[11px] font-bold text-white transition',
                  ddOpen
                    ? 'border-[#e8816a] shadow-[0_0_0_3px_rgba(184,76,43,0.22)]'
                    : 'border-transparent hover:shadow-[0_0_0_3px_rgba(184,76,43,0.18)]'
                )}
              >
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt={userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </button>

              {ddOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 min-w-47.5 overflow-hidden rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_16px_56px_rgba(0,0,0,0.40)] animate-[dropDown_0.18s_ease] dark:border-white/9 dark:bg-[#1e1c19]">
                  <div className="flex items-center gap-2.25 border-b border-[#e0d0c5] px-3.5 py-3.25 pb-2.5 dark:border-white/9">
                    <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-[#b84c2b] to-[#e8816a] text-[12px] font-bold text-white">
                      {userAvatarUrl ? (
                        <img
                          src={userAvatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        userInitials
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold leading-[1.2] text-[#1a1714] dark:text-[#f2f0eb]">
                        {userName}
                      </div>
                      <div className="truncate font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-widest text-[#b84c2b] dark:text-[#e8816a]">
                        {userLevel}
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setDdOpen(false)}
                      className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2.25 text-[13px] font-medium text-[#6b5f58] no-underline transition hover:bg-[rgba(184,76,43,0.04)] hover:text-[#1a1714] dark:text-[#9b9a92] dark:hover:text-[#f2f0eb]"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      View Profile
                    </Link>

                    <Link
                      to="/settings/security"
                      onClick={() => setDdOpen(false)}
                      className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2.25 text-[13px] font-medium text-[#6b5f58] no-underline transition hover:bg-[rgba(184,76,43,0.04)] hover:text-[#1a1714] dark:text-[#9b9a92] dark:hover:text-[#f2f0eb]"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
                      </svg>
                      Settings
                    </Link>

                    <Link
                      to="/activity"
                      onClick={() => setDdOpen(false)}
                      className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2.25 text-[13px] font-medium text-[#6b5f58] no-underline transition hover:bg-[rgba(184,76,43,0.04)] hover:text-[#1a1714] dark:text-[#9b9a92] dark:hover:text-[#f2f0eb]"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Activity
                    </Link>

                    <div className="mx-1.5 my-1 h-px bg-[#e0d0c5] dark:bg-white/9" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2.25 text-left text-[13px] font-medium text-[#e05252] transition hover:bg-[rgba(224,82,82,0.07)] hover:text-[#c43c3c] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>

                      {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  )
}
