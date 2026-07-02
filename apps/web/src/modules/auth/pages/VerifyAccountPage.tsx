import { useEffect, useMemo, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

import api from '../../../lib/axios'
import { STORAGE_KEYS } from '../../../lib/storage/storage-keys'
import { safeSessionStorage } from '../../../lib/storage/safe-storage'
import { OTP_LENGTH, OTP_RESEND_WAIT_SECONDS, TOTAL_OTP_SECONDS } from '../constants/auth.constants'
import type { VerifyPurpose, VerifyState } from '../types/auth.types'
import { maskIdentifier, formatTime } from '../utils/auth-formatters'
import { cn } from '../utils/auth-ui'
import { LogoIcon } from '../components/icons/AuthIcons'

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
    const stored = safeSessionStorage.get(STORAGE_KEYS.otpExpiry)
    if (!stored) {
      const expiry = Date.now() + TOTAL_OTP_SECONDS * 1000
      safeSessionStorage.set(STORAGE_KEYS.otpExpiry, String(expiry))
      return TOTAL_OTP_SECONDS
    }
    return Math.max(0, Math.round((Number(stored) - Date.now()) / 1000))
  })
  const [resendLeft, setResendLeft] = useState<number>(() => {
    const stored = safeSessionStorage.get(STORAGE_KEYS.otpResendExpiry)
    if (!stored) {
      const expiry = Date.now() + OTP_RESEND_WAIT_SECONDS * 1000
      safeSessionStorage.set(STORAGE_KEYS.otpResendExpiry, String(expiry))
      return OTP_RESEND_WAIT_SECONDS
    }
    return Math.max(0, Math.round((Number(stored) - Date.now()) / 1000))
  })
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const otp = useMemo(() => digits.join(''), [digits])
  const destinationText = maskIdentifier(identifier)
  const progressPercent = (secondsLeft / TOTAL_OTP_SECONDS) * 100
  const canResend = resendLeft <= 0 && !isResending

  useEffect(() => {
    const timer = window.setInterval(() => {
      const expiry = Number(safeSessionStorage.get(STORAGE_KEYS.otpExpiry) || 0)
      const resendExpiry = Number(safeSessionStorage.get(STORAGE_KEYS.otpResendExpiry) || 0)
      setSecondsLeft(Math.max(0, Math.round((expiry - Date.now()) / 1000)))
      setResendLeft(Math.max(0, Math.round((resendExpiry - Date.now()) / 1000)))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const clearError = () => setError('')

  const updateDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1)
    setDigits((current) => {
      const next = [...current]
      next[index] = clean
      return next
    })
    clearError()

    if (clean && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (digits[index]) {
        setDigits((current) => {
          const next = [...current]
          next[index] = ''
          return next
        })
        return
      }
      if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        setDigits((current) => {
          const next = [...current]
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
      void handleVerify()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pastedDigits) return

    const nextDigits = Array(OTP_LENGTH).fill('')
    pastedDigits.split('').forEach((digit, index) => {
      nextDigits[index] = digit
    })
    setDigits(nextDigits)
    clearError()
    inputRefs.current[Math.min(pastedDigits.length, OTP_LENGTH - 1)]?.focus()
  }

  const handleVerify = async () => {
    if (!identifier) {
      setError(isPasswordReset ? 'Reset details are missing. Please request a new code.' : 'Verification details are missing. Please register again.')
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
        const response = await api.post('/auth/verify-reset-code', { identifier, otp })
        resetToken = response.data?.data?.resetToken
        if (!resetToken) throw new Error('Reset token was not returned')
      } else {
        await api.post('/auth/verify-account', { identifier, otp })
      }

      setIsSuccess(true)
      safeSessionStorage.remove(STORAGE_KEYS.otpExpiry)
      safeSessionStorage.remove(STORAGE_KEYS.otpResendExpiry)

      window.setTimeout(() => {
        if (isPasswordReset) {
          navigate('/reset-password', { replace: true, state: { resetToken } })
          return
        }
        navigate('/login', { replace: true, state: { message: 'Account verified successfully. Please sign in.' } })
      }, 1300)
    } catch (unknownError: unknown) {
      let message = 'Invalid code. Please try again.'
      if (axios.isAxiosError<{ message?: string }>(unknownError)) {
        message = unknownError.response?.data?.message || message
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
      await api.post('/auth/resend-otp', { identifier, method, purpose })
      const expiry = Date.now() + TOTAL_OTP_SECONDS * 1000
      const resendExpiry = Date.now() + OTP_RESEND_WAIT_SECONDS * 1000
      safeSessionStorage.set(STORAGE_KEYS.otpExpiry, String(expiry))
      safeSessionStorage.set(STORAGE_KEYS.otpResendExpiry, String(resendExpiry))
      setSecondsLeft(TOTAL_OTP_SECONDS)
      setResendLeft(OTP_RESEND_WAIT_SECONDS)
      setDigits(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } catch (unknownError: unknown) {
      let message = 'Could not resend code. Please try again.'
      if (axios.isAxiosError<{ message?: string }>(unknownError)) {
        message = unknownError.response?.data?.message || message
      }
      setError(message)
    } finally {
      setIsResending(false)
    }
  }

  const otpInputClass = (digit: string) =>
    cn(
      'h-12 w-10 rounded-[10px] border-[1.5px] bg-white text-center font-mono text-[20px] font-bold text-[#1a1714] outline-none transition dark:bg-[#252320] dark:text-[#f2f0eb] sm:h-13 sm:w-11',
      digit
        ? 'border-[#4caf7d] shadow-[0_0_0_3px_rgba(76,175,125,0.08)] dark:border-[#5cc98a]'
        : 'border-[#e0d0c5] focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.10)] dark:border-white/15 dark:focus:border-[#e8816a]'
    )

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5ede4] px-4 py-10 font-['DM_Sans',sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <div className="pointer-events-none absolute -left-30 -top-30 h-85 w-85 rounded-full bg-[rgba(184,76,43,0.12)] blur-3xl dark:bg-[rgba(232,129,106,0.10)]" />
      <div className="pointer-events-none absolute -bottom-35 -right-30 h-90 w-90 rounded-full bg-[rgba(59,108,183,0.10)] blur-3xl dark:bg-[rgba(107,159,232,0.08)]" />

      <div className="relative w-full max-w-115 overflow-hidden rounded-[28px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_24px_80px_rgba(26,23,20,0.14)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="h-1.25 bg-[#b84c2b] dark:bg-[#e8816a]" />
        <main className="px-5 py-8 text-center sm:px-8">
          <Link to="/" className="mb-6 inline-flex items-center justify-center gap-2">
            <LogoIcon className="h-10 w-10" />
            <span className="text-[24px] font-black tracking-[-0.8px]">
              immin<span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
            </span>
          </Link>

          <div className="relative mx-auto mb-5 h-2 overflow-hidden rounded-full bg-[#e0d0c5] dark:bg-white/10">
            <div className="h-full rounded-full bg-[#b84c2b] transition-all dark:bg-[#e8816a]" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="relative mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#6b5f58] dark:text-[#9b9a92]">
            {isPasswordReset ? 'Password Recovery' : 'Account Verification'}
          </div>

          <h1 className="relative mb-2 font-serif text-[clamp(22px,5vw,30px)] font-bold leading-[1.1] text-[#1a1714] dark:text-[#f2f0eb]">
            {isPasswordReset ? 'Verify reset code' : 'Verify your account'}
          </h1>

          <p className="relative mx-auto mb-6.5 max-w-75 text-[13.5px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
            We sent a 6-digit code to<br />
            <span className="break-all font-mono text-[11.5px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">{destinationText}</span>.
            <br />
            {isPasswordReset ? 'Enter it below to reset your password.' : 'Enter it below to continue.'}
          </p>

          <div className="relative mb-1.5 flex flex-nowrap justify-center gap-1.75" role="group" aria-label="6-digit verification code">
            {digits.map((digit, index) => (
              <div className="flex items-center gap-1.75" key={index}>
                {index === 3 && <span className="h-1.25 w-1.25 rounded-full bg-[#e0d0c5] dark:bg-white/15" aria-hidden="true" />}
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
            <div className="mt-2.5 flex min-h-5 items-center justify-center gap-1.5 text-xs text-[#d94535] dark:text-[#ff6b5f]" role="alert" aria-live="polite">
              <span>{error}</span>
            </div>
          ) : (
            <div className="mt-2.5 min-h-5 font-mono text-[10px] uppercase tracking-widest text-[#6b5f58] dark:text-[#9b9a92]">
              Code expires in {formatTime(secondsLeft)}
            </div>
          )}

          {isSuccess && (
            <div className="mt-4 rounded-xl border border-[rgba(76,175,125,0.20)] bg-[rgba(76,175,125,0.08)] px-3 py-2 text-[12px] font-semibold text-[#2d6a47] dark:text-[#5cc98a]">
              Verified. Redirecting...
            </div>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || otp.length < OTP_LENGTH}
            className="mt-6 w-full rounded-[11px] bg-[#b84c2b] p-3.25 text-[15px] font-bold tracking-[0.01em] text-[#f5ede4] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            {isVerifying ? 'Verifying...' : isPasswordReset ? 'Verify reset code' : 'Verify account'}
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
              {isResending ? 'Sending...' : canResend ? 'Resend code' : `Resend in ${resendLeft}s`}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
