import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'


const LAST_ONLINE_PATH_KEY = 'last_online_path_before_offline'

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(' ')
}

const LogoIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={cn(
        'block shrink-0 rounded-xl opacity-60 grayscale-[0.5]',
        className
      )}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="10" y="10" width="80" height="80" rx="18" fill="#050505" />
      <g transform="translate(-5, 1)">
        <rect x="31" y="35" width="9" height="34" rx="4.5" fill="#fff8ed" />
        <circle cx="35.5" cy="28.5" r="5.3" fill="#f15a35" />
        <path
          d="M64 32.8C73.8 34.7 79.5 42.2 79.5 51.5 79.5 61.8 71.2 68 60.2 68c-7 0-12-2.5-15.1-7.2"
          fill="none"
          stroke="#fff8ed"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <line
          x1="63.8"
          y1="55.5"
          x2="75.8"
          y2="67.5"
          stroke="#f15a35"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

const RefreshIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  )
}

const RouterIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M1 6s1-2 5-2c3 0 4 2 7 2 3 0 4-2 7-2s4 2 4 2v14s-1-2-4-2c-3 0-4 2-7 2-3 0-4-2-7-2-4 0-5 2-5 2z" />
    </svg>
  )
}

const PhoneIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  )
}

const InfoIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

const XCircleIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  )
}

const ClockIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default function NoConnectionPage() {
  const navigate = useNavigate()

  const redirectStartedRef = useRef(false)

  const [toast, setToast] = useState('')
  const [isToastVisible, setIsToastVisible] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [signalLevel, setSignalLevel] = useState(0)
  const [hasRedirectStarted, setHasRedirectStarted] = useState(false)

  const disconnectedSince = useMemo(() => {
    return new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  const showToast = useCallback((message: string) => {
    setToast(message)
    setIsToastVisible(true)

    window.setTimeout(() => {
      setIsToastVisible(false)
    }, 2800)
  }, [])

  const redirectToPreviousPage = useCallback(() => {
    if (redirectStartedRef.current) {
      return
    }

    redirectStartedRef.current = true
    setHasRedirectStarted(true)

    const previousPath =
      sessionStorage.getItem(LAST_ONLINE_PATH_KEY) || '/dashboard'

    sessionStorage.removeItem(LAST_ONLINE_PATH_KEY)

    navigate(previousPath, {
      replace: true,
    })
  }, [navigate])

  const handleReconnectSuccess = useCallback(() => {
    if (redirectStartedRef.current) {
      return
    }

    setSignalLevel(4)
    setIsRetrying(false)
    showToast('Connection restored! Redirecting…')

    window.setTimeout(() => {
      redirectToPreviousPage()
    }, 700)
  }, [redirectToPreviousPage, showToast])

  const handleRetry = () => {
    if (isRetrying || redirectStartedRef.current) {
      return
    }

    setIsRetrying(true)
    setSignalLevel(0)

    const intervals = [1, 2, 3, 4]

    intervals.forEach((level, index) => {
      window.setTimeout(() => {
        setSignalLevel(level)
      }, 380 * (index + 1))
    })

    window.setTimeout(() => {
      if (navigator.onLine) {
        handleReconnectSuccess()
        return
      }

      setSignalLevel(0)
      setIsRetrying(false)
      showToast('Still offline. Check your connection and try again.')
    }, 2200)
  }

  useEffect(() => {
    const handleOnline = () => {
      handleReconnectSuccess()
    }

    window.addEventListener('online', handleOnline)

    let reconnectTimeout: number | undefined

    if (navigator.onLine) {
      reconnectTimeout = window.setTimeout(() => {
        handleReconnectSuccess()
      }, 0)
    }

    return () => {
      window.removeEventListener('online', handleOnline)

      if (reconnectTimeout) {
        window.clearTimeout(reconnectTimeout)
      }
    }
  }, [handleReconnectSuccess])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f5ede4] font-[DM_Sans,sans-serif] text-[#1a1714] transition-colors dark:bg-[#141412] dark:text-[#f2f0eb]">
      {/* Background Grain */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]">
        <div className="h-full w-full bg-[url('data:image/svg+xml,%3Csvg_viewBox=%270_0_200_200%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter_id=%27n%27%3E%3CfeTurbulence_type=%27fractalNoise%27_baseFrequency=%270.9%27_numOctaves=%274%27_stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect_width=%27100%25%27_height=%27100%25%27_filter=%27url(%23n)%27_opacity=%271%27/%3E%3C/svg%3E')] bg-size-[180px_180px]" />
      </div>

      {/* Toast */}
      <div
        className={cn(
          'pointer-events-none fixed bottom-7 left-1/2 z-220 -translate-x-1/2 translate-y-5 whitespace-nowrap rounded-full bg-[#1a1714] px-4.5 py-2.5 text-[13px] font-medium text-[#f5ede4] opacity-0 shadow-[0_16px_56px_rgba(0,0,0,0.4)] transition-all duration-300',
          'dark:bg-[#f2f0eb] dark:text-[#141412]',
          isToastVisible && 'translate-y-0 opacity-100'
        )}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>

      {/* Top Bar */}
      <header className="sticky top-0 z-20 flex h-13.5 items-center justify-between border-b border-[#e0d0c5] bg-[rgba(245,237,228,0.92)] px-4 shadow-[0_1px_0_rgba(253,248,245,0.6)] backdrop-blur-2xl sm:px-8 lg:px-10 dark:border-white/10 dark:bg-[rgba(20,20,18,0.92)] dark:shadow-[0_1px_0_rgba(30,28,25,0.6)]">
        <div className="flex items-center gap-2.5">
          <LogoIcon className="h-7.5 w-7.5 rounded-[9px]" />

          <span className="font-serif text-[22px] font-extrabold leading-none tracking-[-0.5px] text-[#1a1714]/45 dark:text-[#f2f0eb]/45">
            immin
            <span className="text-[#b84c2b]/70 dark:text-[#e8816a]/70">
              iq
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#6b5f58]/50 sm:block dark:text-[#9b9a92]/50">
            Help
          </span>

          <span className="hidden rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#6b5f58]/50 md:block dark:text-[#9b9a92]/50">
            Community Guidelines
          </span>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(138,98,0,0.18)] bg-[rgba(138,98,0,0.07)] px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#c98000] dark:border-[rgba(240,168,66,0.18)] dark:bg-[rgba(240,168,66,0.07)] dark:text-[#f0a842]">
            <span className="h-1.25 w-1.25 animate-pulse rounded-full bg-[#c98000] dark:bg-[#f0a842]" />
            No connection
          </div>

          
        </div>
      </header>

      <div className="relative z-10 flex min-h-[calc(100vh-54px)] flex-col">
        <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-8 lg:px-12">
          {/* Background Blobs */}
          <div className="pointer-events-none absolute left-[-5%] top-[5%] h-75 w-75 rounded-full bg-[#c98000]/10 blur-3xl dark:bg-[#f0a842]/5" />
          <div className="pointer-events-none absolute bottom-[10%] right-[-4%] h-55 w-55 rounded-full bg-[#b84c2b]/10 blur-3xl dark:bg-[#e8816a]/5" />
          <div className="pointer-events-none absolute left-[42%] top-[55%] h-40 w-40 rounded-full bg-[#3b6cb7]/10 blur-3xl dark:bg-[#6b9fe8]/5" />

          {/* Wifi Illustration */}
          <div className="relative mb-7 flex h-22.5 w-27.5 items-end justify-center">
            <div className="absolute bottom-0 left-1/2 h-20.5 w-20.5 -translate-x-1/2 rounded-full border-[3px] border-[#1a1714]/15 dark:border-[#f2f0eb]/15" />
            <div className="absolute bottom-0 left-1/2 h-13 w-13 -translate-x-1/2 rounded-full border-[3px] border-[#1a1714]/15 dark:border-[#f2f0eb]/15" />
            <div className="absolute bottom-0 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-[3px] border-[#1a1714]/15 dark:border-[#f2f0eb]/15" />
            <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#c98000] dark:bg-[#f0a842]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-0.75 w-24 rotate-[-42deg] -translate-y-2 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
            </div>
          </div>

          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[rgba(138,98,0,0.18)] bg-[rgba(138,98,0,0.07)] px-3.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.18em] text-[#c98000] dark:border-[rgba(240,168,66,0.18)] dark:bg-[rgba(240,168,66,0.07)] dark:text-[#f0a842]">
            <span className="h-1.25 w-1.25 animate-pulse rounded-full bg-[#c98000] dark:bg-[#f0a842]" />
            Offline
          </div>

          <h1 className="mb-3 text-center font-serif text-[clamp(24px,4vw,34px)] font-extrabold leading-[1.2] tracking-[-0.6px] text-[#1a1714] dark:text-[#f2f0eb]">
            You appear to be offline
          </h1>

          <p className="mx-auto mb-8 max-w-95 text-center text-sm leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
            Imminiq can&apos;t reach its servers. Check your Wi-Fi or mobile data,
            then try reconnecting.
          </p>

          {/* Signal Bars */}
          <div className="mb-8 flex h-8 items-end gap-1.25" aria-hidden="true">
            {[35, 55, 75, 100].map((height, index) => {
              const isAlive = signalLevel > index

              return (
                <div
                  key={height}
                  className={cn(
                    'w-2.5 rounded-t-[3px] transition-all duration-300',
                    isAlive
                      ? 'bg-[#c98000] opacity-100 dark:bg-[#f0a842]'
                      : 'bg-[#b84c2b]/35 dark:bg-[#e8816a]/35'
                  )}
                  style={{ height: `${height}%` }}
                />
              )
            })}
          </div>

          {/* Retry Button */}
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying || hasRedirectStarted}
            className={cn(
              'mb-9 inline-flex items-center gap-2 rounded-xl bg-[#b84c2b] px-8 py-3.25 text-sm font-bold text-[#fdf8f5] transition hover:-translate-y-0.5 hover:bg-[#963d22] hover:shadow-[0_8px_28px_rgba(184,76,43,0.28)] disabled:cursor-wait disabled:opacity-80 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]',
              isRetrying && 'animate-pulse'
            )}
          >
            <RefreshIcon className={cn(isRetrying && 'animate-spin')} />
            {hasRedirectStarted
              ? 'Redirecting…'
              : isRetrying
                ? 'Checking connection…'
                : 'Try reconnecting'}
          </button>

          <div className="mb-7 h-px w-full max-w-120 bg-[#e0d0c5]/60 dark:bg-white/10" />

          {/* Status Cards */}
          <div className="mb-7 grid w-full max-w-120 grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3.5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1e1c19]">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,rgba(184,76,43,0.3),#b84c2b)] dark:bg-[linear-gradient(90deg,rgba(232,129,106,0.3),#e8816a)]" />
              <div className="mb-1.5 font-mono text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58]/55 dark:text-[#9b9a92]/55">
                Internet
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                <span className="h-1.75 w-1.75 rounded-full bg-[#b84c2b]/70 dark:bg-[#e8816a]/70" />
                Disconnected
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3.5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1e1c19]">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,rgba(138,98,0,0.08),#c98000)] dark:bg-[linear-gradient(90deg,rgba(240,168,66,0.10),#f0a842)]" />
              <div className="mb-1.5 font-mono text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58]/55 dark:text-[#9b9a92]/55">
                Imminiq Servers
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                <span className="h-1.75 w-1.75 animate-pulse rounded-full bg-[#c98000] dark:bg-[#f0a842]" />
                Waiting for connection…
              </div>
            </div>
          </div>

          {/* Helpful Tips */}
          <div className="w-full max-w-120">
            <p className="mb-3 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-[#6b5f58]/50 dark:text-[#9b9a92]/50">
              Try this
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                {
                  icon: <RouterIcon />,
                  title: 'Check router',
                  description: 'Restart Wi-Fi or move closer to the router.',
                },
                {
                  icon: <PhoneIcon />,
                  title: 'Use mobile data',
                  description: 'Switch networks if Wi-Fi is unavailable.',
                },
                {
                  icon: <InfoIcon />,
                  title: 'Wait a moment',
                  description: 'The connection may restore automatically.',
                },
              ].map((tip) => (
                <div
                  key={tip.title}
                  className="flex items-start gap-2.5 rounded-xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-3.5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1e1c19]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                    {tip.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 text-xs font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                      {tip.title}
                    </div>

                    <p className="text-[11px] leading-[1.45] text-[#6b5f58] dark:text-[#9b9a92]">
                      {tip.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Row */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.25 rounded-full border border-[#e0d0c5] px-3 py-1.25 font-mono text-[8.5px] uppercase tracking-widest text-[#6b5f58]/55 dark:border-white/10 dark:text-[#9b9a92]/55">
              <XCircleIcon />
              ERR_INTERNET_DISCONNECTED
            </span>

            <span className="inline-flex items-center gap-1.25 rounded-full border border-[#e0d0c5] px-3 py-1.25 font-mono text-[8.5px] uppercase tracking-widest text-[#6b5f58]/55 dark:border-white/10 dark:text-[#9b9a92]/55">
              <ClockIcon />
              Since {disconnectedSince}
            </span>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e0d0c5] bg-[rgba(245,237,228,0.92)] px-4 py-4.5 shadow-[0_-1px_0_rgba(253,248,245,0.6)] backdrop-blur-2xl sm:px-8 lg:px-10 dark:border-white/10 dark:bg-[rgba(20,20,18,0.92)] dark:shadow-[0_-1px_0_rgba(30,28,25,0.6)]">
          <div className="font-serif text-base font-extrabold text-[#b84c2b] dark:text-[#e8816a]">
            Imminiq
          </div>

          <div className="flex flex-wrap gap-5">
            {[
              'Privacy Policy',
              'Terms of Service',
              'Academic Integrity',
              'Contact',
            ].map((item) => (
              <span
                key={item}
                className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#6b5f58]/40 dark:text-[#9b9a92]/40"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="font-mono text-[8.5px] tracking-[0.06em] text-[#6b5f58]/40 dark:text-[#9b9a92]/40">
            © 2026 Imminiq. Scholarly Rigor, Digital Craft.
          </div>
        </footer>
      </div>
    </div>
  )
}