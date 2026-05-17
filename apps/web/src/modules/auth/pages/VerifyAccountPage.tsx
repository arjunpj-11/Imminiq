import { useEffect, useMemo, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import api from '../../../lib/axios'


type VerifyPurpose = 'account_verification' | 'password_reset'

type VerifyState = {
  identifier?: string
  method?: 'email' | 'phone'
  purpose?: VerifyPurpose
  from?: 'register' | 'forgot-password'
}

const TOTAL_SECONDS = 10 * 60
const RESEND_WAIT = 45
const OTP_LENGTH = 6

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(' ')
}

const maskIdentifier = (identifier?: string) => {
  if (!identifier) return 'your registered account'

  if (identifier.includes('@')) {
    const [local, domain] = identifier.split('@')

    if (!local || !domain) return identifier

    const maskedLocal =
      local.length <= 2
        ? `${local[0]}***`
        : `${local[0]}***${local.slice(-1)}`

    return `${maskedLocal}@${domain}`
  }

  const digits = identifier.replace(/\D/g, '')

  if (digits.length < 4) return identifier

  return `${identifier.slice(0, 3)} ****** ${identifier.slice(-3)}`
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds
  ).padStart(2, '0')}`
}

const LogoIcon = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={cn('block shrink-0 rounded-[10px]', className)}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Imminiq logo mark"
    >
      <rect x="10" y="10" width="80" height="80" rx="18" fill="#050505" />
      <g transform="translate(-5, 1)">
        <rect x="31" y="35" width="9" height="34" rx="4.5" fill="#fff8ed" />
        <circle cx="35.5" cy="28.5" r="5.3" fill="#f15a35" />
        <path
          d="M64 32.8 C73.8 34.7 79.5 42.2 79.5 51.5 C79.5 61.8 71.2 68 60.2 68 C53.2 68 48.2 65.5 45.1 60.8"
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

export default function VerifyAccountPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const routeState = location.state as VerifyState | null

  const identifier = routeState?.identifier
  const method = routeState?.method
  const purpose: VerifyPurpose = routeState?.purpose || 'account_verification'
  const isPasswordReset = purpose === 'password_reset'

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')

  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const stored = sessionStorage.getItem('otp_expiry')

    if (!stored) {
      const expiry = Date.now() + TOTAL_SECONDS * 1000
      sessionStorage.setItem('otp_expiry', String(expiry))
      return TOTAL_SECONDS
    }

    return Math.max(0, Math.round((Number(stored) - Date.now()) / 1000))
  })

  const [resendLeft, setResendLeft] = useState<number>(() => {
    const stored = sessionStorage.getItem('otp_resend_expiry')

    if (!stored) {
      const expiry = Date.now() + RESEND_WAIT * 1000
      sessionStorage.setItem('otp_resend_expiry', String(expiry))
      return RESEND_WAIT
    }

    return Math.max(0, Math.round((Number(stored) - Date.now()) / 1000))
  })

  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const otp = useMemo(() => digits.join(''), [digits])

  const destinationText = maskIdentifier(identifier)

  const progressPercent = (secondsLeft / TOTAL_SECONDS) * 100

  const timerState =
    secondsLeft <= 20 ? 'urgent' : secondsLeft <= 50 ? 'warn' : 'normal'

  const canResend = resendLeft <= 0 && !isResending

  useEffect(() => {
    if (!identifier) {
      navigate(isPasswordReset ? '/forgot-password' : '/register', {
        replace: true,
      })
    }
  }, [identifier, isPasswordReset, navigate])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (resendLeft <= 0) return

    const timer = window.setInterval(() => {
      setResendLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendLeft])

  useEffect(() => {
    const focusTimer = window.setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 500)

    return () => window.clearTimeout(focusTimer)
  }, [])

  const clearError = () => {
    setError('')
  }

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)

    setDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })

    clearError()

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
  event: KeyboardEvent<HTMLInputElement>,
  index: number
) => {
    if (event.key === 'Backspace') {
      event.preventDefault()

      if (digits[index]) {
        setDigits((prev) => {
          const next = [...prev]
          next[index] = ''
          return next
        })

        return
      }

      if (index > 0) {
        inputRefs.current[index - 1]?.focus()

        setDigits((prev) => {
          const next = [...prev]
          next[index - 1] = ''
          return next
        })
      }
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      inputRefs.current[index - 1]?.focus()
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }

    if (event.key === 'Enter') {
      handleVerify()
    }
  }

 const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()

    const pastedText = event.clipboardData.getData('text')
    const pastedDigits = pastedText.replace(/\D/g, '').slice(0, OTP_LENGTH)

    if (!pastedDigits) return

    const nextDigits = Array(OTP_LENGTH).fill('')

    pastedDigits.split('').forEach((digit, index) => {
      nextDigits[index] = digit
    })

    setDigits(nextDigits)
    clearError()

    const nextFocusIndex = Math.min(pastedDigits.length, OTP_LENGTH - 1)
    inputRefs.current[nextFocusIndex]?.focus()
  }

  const handleVerify = async () => {
    if (!identifier) {
      setError(
        isPasswordReset
          ? 'Reset details are missing. Please request a new code.'
          : 'Verification details are missing. Please register again.'
      )
      return
    }

    if (otp.length < OTP_LENGTH) {
      setError('Please enter all 6 digits.')
      inputRefs.current[0]?.focus()
      return
    }

    if (secondsLeft <= 0) {
      setError('Code expired. Please request a new one.')
      return
    }

    try {
      setIsVerifying(true)
      clearError()

      let resetToken: string | undefined

if (isPasswordReset) {
  const response = await api.post('/auth/verify-reset-code', {
    identifier,
    otp,
  })

  resetToken = response.data?.data?.resetToken

  if (!resetToken) {
    throw new Error('Reset token was not returned')
  }
} else {
  await api.post('/auth/verify-account', {
    identifier,
    otp,
  })
}
      setIsSuccess(true)

      sessionStorage.removeItem('otp_expiry')
      sessionStorage.removeItem('otp_resend_expiry')

      window.setTimeout(() => {
        if (isPasswordReset) {
          navigate('/reset-password', {
  replace: true,
  state: {
    resetToken,
  },
})

          return
        }

        navigate('/login', {
  replace: true,
  state: {
    message: 'Account verified successfully. Please sign in.',
  },
})
      }, 1300)
   } catch (error: unknown) {
  let message = 'Invalid code. Please try again.'

  if (axios.isAxiosError<{ message?: string }>(error)) {
    message = error.response?.data?.message || message
  }

  setDigits(Array(OTP_LENGTH).fill(''))
  inputRefs.current[0]?.focus()
  setError(message)
} finally {
  setIsVerifying(false)
}
  }

  const handleResend = async () => {
    if (!identifier || !canResend) return

    try {
      setIsResending(true)
      clearError()

      const resendPurpose = isPasswordReset
        ? 'password_reset'
        : method === 'phone'
          ? 'phone_verification'
          : 'email_verification'

      await api.post('/auth/send-otp', {
        identifier,
        purpose: resendPurpose,
      })

      sessionStorage.setItem(
        'otp_expiry',
        String(Date.now() + TOTAL_SECONDS * 1000)
      )

      sessionStorage.setItem(
        'otp_resend_expiry',
        String(Date.now() + RESEND_WAIT * 1000)
      )

      setDigits(Array(OTP_LENGTH).fill(''))
      setSecondsLeft(TOTAL_SECONDS)
      setResendLeft(RESEND_WAIT)
      inputRefs.current[0]?.focus()
    } catch (error: unknown) {
      let message = 'Failed to resend OTP. Please try again.'

      if (axios.isAxiosError<{ message?: string }>(error)) {
        message = error.response?.data?.message || message
      }

      setError(message)
    } finally {
      setIsResending(false)
    }
  }

  const handleBack = () => {
    setIsExiting(true)

    window.setTimeout(() => {
      navigate(isPasswordReset ? '/forgot-password' : '/register')
    }, 500)
  }

  const otpInputClass = (digit: string) =>
    cn(
      'h-14 w-12 shrink-0 rounded-xl border-[1.5px] bg-white text-center font-mono text-[22px] font-semibold text-[#1a1714] caret-[#b84c2b] outline-none transition placeholder:text-sm placeholder:text-[#e0d0c5]',
      'focus:-translate-y-0.5 focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.09)]',
      'dark:border-white/15 dark:bg-[#252320] dark:text-[#f2f0eb] dark:caret-[#e8816a] dark:placeholder:text-white/15',
      'dark:focus:border-[#e8816a] dark:focus:shadow-[0_0_0_3px_rgba(232,129,106,0.18)]',
      digit &&
        'border-[#e8816a] bg-[rgba(184,76,43,0.08)] dark:border-[#f5a090] dark:bg-[rgba(232,129,106,0.09)]',
      error &&
        'border-[#d94535] bg-[rgba(217,69,53,0.07)] shadow-[0_0_0_3px_rgba(217,69,53,0.08)] dark:border-[#ff6b5f] dark:bg-[rgba(255,107,95,0.10)]'
    )

  return (
    <>
      {isSuccess && (
        <div
          className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-4 bg-[#f5ede4] px-6 text-center text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]"
          aria-live="polite"
          aria-atomic="true"
          role="status"
        >
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[rgba(76,175,125,0.25)] bg-[rgba(76,175,125,0.10)] text-[#4caf7d] dark:text-[#5cc98a]"
            aria-hidden="true"
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="font-serif text-[clamp(24px,5vw,30px)] font-bold">
            {isPasswordReset ? 'Code Verified' : 'Account Verified'}
          </div>

          <div className="text-[13.5px] text-[#6b5f58] dark:text-[#9b9a92]">
            {isPasswordReset
              ? 'Now create your new password.'
              : 'Welcome to Imminiq. Your journey starts now.'}
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex min-h-screen flex-col bg-[#f5ede4] text-[#1a1714] font-[DM_Sans,sans-serif]',
          'dark:bg-[#141412] dark:text-[#f2f0eb]',
          isExiting &&
            'pointer-events-none fixed inset-0 scale-90 opacity-0 transition duration-500'
        )}
      >
        <nav
          className="relative z-10 flex shrink-0 items-center justify-between px-5 py-4"
          aria-label="Site navigation"
        >
          <Link
            className="inline-flex items-center gap-2.5 leading-none no-underline"
            to="/"
            aria-label="Imminiq home"
          >
            <LogoIcon className="h-8.5 w-8.5" />

            <span className="text-xl font-bold leading-none tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
              immin<span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
              <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
         

            <button
              className="inline-flex items-center gap-1.5 bg-transparent px-0.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#6b5f58] transition hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
              onClick={handleBack}
              type="button"
              aria-label="Back"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
          </div>
        </nav>

        <main className="flex flex-1 flex-col items-center justify-center px-4 pb-9 pt-5">
          <div className="relative w-full max-w-115 overflow-hidden rounded-[20px] border border-[#e0d0c5] bg-[#fdf8f5] px-5 py-8 text-center shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.07)] sm:px-7">
            <div className="pointer-events-none absolute -top-15 left-1/2 h-40 w-65 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(184,76,43,0.09)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse,rgba(232,129,106,0.13)_0%,transparent_70%)]" />

            <div
              className="relative mb-4.5 flex justify-center"
              aria-hidden="true"
            >
              <div className="flex h-15.5 w-15.5 items-center justify-center rounded-full border-[1.5px] border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a]">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {isPasswordReset ? (
                    <>
                      <path d="M12 17a2 2 0 0 0 2-2v-2a2 2 0 1 0-4 0v2a2 2 0 0 0 2 2z" />
                      <path d="M19 11V8a7 7 0 0 0-14 0v3" />
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                    </>
                  ) : (
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  )}
                </svg>
              </div>
            </div>

            <div className="relative mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#6b5f58] dark:text-[#9b9a92]">
              {isPasswordReset ? 'Password Recovery' : 'Account Verification'}
            </div>

            <h1 className="relative mb-2 font-serif text-[clamp(22px,5vw,30px)] font-bold leading-[1.1] text-[#1a1714] dark:text-[#f2f0eb]">
              {isPasswordReset ? 'Verify reset code' : 'Verify your account'}
            </h1>

            <p className="relative mx-auto mb-6.5 max-w-75 text-[13.5px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
              We sent a 6-digit code to
              <br />
              <span className="break-all font-mono text-[11.5px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                {destinationText}
              </span>
              .
              <br />
              {isPasswordReset
                ? 'Enter it below to reset your password.'
                : 'Enter it below to continue.'}
            </p>

            <div
              className="relative mb-1.5 flex flex-nowrap justify-center gap-1.75"
              role="group"
              aria-label="6-digit verification code"
            >
              {digits.map((digit, index) => (
                <div className="flex items-center gap-1.75" key={index}>
                  {index === 3 && (
                    <div
                      className="flex shrink-0 items-center px-0.5"
                      aria-hidden="true"
                    >
                      <span className="h-1.25 w-1.25 rounded-full bg-[#e0d0c5] dark:bg-white/15" />
                    </div>
                  )}

                  <input
                    ref={(element) => {
                      inputRefs.current[index] = element
                    }}
                    className={otpInputClass(digit)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    placeholder="·"
                    autoComplete="one-time-code"
                    aria-label={`Digit ${index + 1}`}
                    value={digit}
                    onChange={(event) => updateDigit(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onPaste={handlePaste}
                    onFocus={(event) => {
                      event.target.select()
                      clearError()
                    }}
                  />
                </div>
              ))}
            </div>

            {error ? (
              <div
                className="mt-2.5 flex min-h-5 items-center justify-center gap-1.5 text-xs text-[#d94535] dark:text-[#ff6b5f]"
                role="alert"
                aria-live="polite"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            ) : (
              <div className="mt-2.5 min-h-5 text-xs text-[#6b5f58] dark:text-[#9b9a92]">
                Enter the code before it expires.
              </div>
            )}

            <div className="relative mt-6">
              <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-[#6b5f58] dark:text-[#9b9a92]">
                <span>Code expires in</span>
                <span
                  className={cn(
                    timerState === 'urgent' &&
                      'text-[#d94535] dark:text-[#ff6b5f]',
                    timerState === 'warn' &&
                      'text-[#b8820a] dark:text-[#f0a842]',
                    timerState === 'normal' &&
                      'text-[#4caf7d] dark:text-[#5cc98a]'
                  )}
                >
                  {formatTime(secondsLeft)}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#e0d0c5] dark:bg-white/15">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    timerState === 'urgent' &&
                      'bg-[#d94535] dark:bg-[#ff6b5f]',
                    timerState === 'warn' &&
                      'bg-[#b8820a] dark:bg-[#f0a842]',
                    timerState === 'normal' &&
                      'bg-[#4caf7d] dark:bg-[#5cc98a]'
                  )}
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || otp.length < OTP_LENGTH}
              className={cn(
                'mt-6 w-full rounded-[11px] bg-[#b84c2b] p-3.25 text-[15px] font-bold tracking-[0.01em] text-[#f5ede4] transition',
                'hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)]',
                'active:translate-y-0 active:shadow-none',
                'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none',
                'dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]'
              )}
            >
              {isVerifying
                ? 'Verifying...'
                : isPasswordReset
                  ? 'Verify reset code'
                  : 'Verify account'}
            </button>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className={cn(
                  'font-mono text-[10px] uppercase tracking-widest transition',
                  canResend
                    ? 'text-[#b84c2b] hover:text-[#963d22] dark:text-[#e8816a] dark:hover:text-[#f5a090]'
                    : 'cursor-not-allowed text-[#6b5f58]/70 dark:text-[#9b9a92]/70'
                )}
              >
                {isResending
                  ? 'Sending...'
                  : canResend
                    ? 'Resend code'
                    : `Resend in ${resendLeft}s`}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}