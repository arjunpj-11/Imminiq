import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import api from '../../../lib/axios'

type FormState = {
  newPassword: string
  confirmPassword: string
}

type FormErrors = {
  newPassword?: string
  confirmPassword?: string
  api?: string
}

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(' ')
}

const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: '', textClass: '' }

  let score = 0

  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const level = Math.min(4, score)

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return {
    score: level,
    label: labels[level],
    textClass:
      level >= 3
        ? 'text-[#4caf7d] dark:text-[#5cc98a]'
        : 'text-[#b84c2b] dark:text-[#e8816a]',
  }
}

const validatePassword = (password: string) => {
  if (!password) return 'New password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (password.length > 128) return 'Password is too long.'
  if (!/[a-zA-Z]/.test(password)) return 'Must include at least one letter.'
  if (!/[0-9\W]/.test(password)) return 'Must include a number or symbol.'
  return undefined
}

/* ── Shared icon components matching LoginForm ── */

const LogoIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={cn('block shrink-0 rounded-xl', className)}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
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

const AlertIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={cn('shrink-0', className)}
    width="12"
    height="12"
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
)

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 0 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

/* ── Shared style helpers matching LoginForm exactly ── */

const labelClass =
  'font-mono text-[9.5px] font-medium uppercase tracking-[0.1em] text-[#1a1714] dark:text-[#f2f0eb]'

const errorClass =
  'mt-1.5 flex items-center gap-1.5 text-[11.5px] leading-normal text-[#d94535] dark:text-[#ff6b5f]'

const inputBaseClass = (error?: string, valid?: boolean) =>
  cn(
    'w-full rounded-[10px] border-[1.5px] bg-white px-3.5 py-[11px] text-sm text-[#1a1714] outline-none transition',
    'placeholder:text-[#9f8f86]',
    'focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.09)]',
    'dark:border-white/15 dark:bg-[#252320] dark:text-[#f2f0eb] dark:placeholder:text-[#aaa59d]',
    'dark:focus:border-[#e8816a] dark:focus:shadow-[0_0_0_3px_rgba(232,129,106,0.18)]',
    error &&
      'border-[#d94535] bg-[rgba(217,69,53,0.07)] shadow-[0_0_0_3px_rgba(217,69,53,0.08)] dark:border-[#ff6b5f] dark:bg-[rgba(255,107,95,0.10)]',
    valid &&
      !error &&
      'border-[#4caf7d] shadow-[0_0_0_3px_rgba(76,175,125,0.08)] dark:border-[#5cc98a]'
  )

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as { resetToken?: string } | null
  const resetToken = state?.resetToken

  const [form, setForm] = useState<FormState>({
    newPassword: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const strength = useMemo(
    () => getPasswordStrength(form.newPassword),
    [form.newPassword]
  )

  const checks = {
    length: form.newPassword.length >= 8,
    letter: /[a-zA-Z]/.test(form.newPassword),
    numberOrSymbol: /[0-9\W]/.test(form.newPassword),
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
        api: undefined,
      }))
    }
  }

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    if (name === 'newPassword') {
      setErrors((prev) => ({
        ...prev,
        newPassword: validatePassword(value),
      }))
    }

    if (name === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: !value
          ? 'Please confirm your password.'
          : value !== form.newPassword
            ? "Passwords don't match."
            : undefined,
      }))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newErrors: FormErrors = {}

    const pwErr = validatePassword(form.newPassword)

    if (pwErr) {
      newErrors.newPassword = pwErr
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.'
    } else if (form.confirmPassword !== form.newPassword) {
      newErrors.confirmPassword = "Passwords don't match."
    }

    if (!resetToken) {
      newErrors.api =
        'Reset session expired. Please request a new password reset code.'
    }

    setErrors(newErrors)
    setTouched({
      newPassword: true,
      confirmPassword: true,
    })

    if (Object.keys(newErrors).length > 0) return

    try {
      setIsSubmitting(true)

      await api.post('/auth/reset-password', {
        resetToken,
        newPassword: form.newPassword,
      })

      setIsSuccess(true)
    } catch (error: unknown) {
      let message = 'Failed to reset password. Please try again.'

      if (axios.isAxiosError<{ message?: string }>(error)) {
        message = error.response?.data?.message || message
      }

      setErrors({ api: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── Success State ── */
  if (isSuccess) {
    return (
      <div
        className={cn(
          'min-h-screen bg-[#f5ede4] text-[#1a1714] font-family:DM_Sans,sans-serif',
          'dark:bg-[#141412] dark:text-[#f2f0eb]',
          'flex flex-col items-center justify-center px-4 py-12'
        )}
      >
        <div
          className={cn(
            'w-full max-w-110 rounded-[20px] border border-[#e0d0c5] bg-[#fdf8f5] px-8 py-10 text-center shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)]',
            'dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.07)]'
          )}
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(76,175,125,0.12)] text-[#4caf7d] dark:bg-[rgba(92,201,138,0.12)] dark:text-[#5cc98a]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#9b9a92]">
            Password Updated
          </div>

          <h1 className="mb-3 font-serif text-[28px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
            Reset successful
          </h1>

          <p className="mx-auto mb-7 max-w-77.5 text-[13px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
            Your password has been changed. You can now sign in with your new
            credentials.
          </p>

          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className={cn(
              'relative w-full overflow-hidden rounded-[11px] bg-[#b84c2b] p-3.25 text-[15px] font-bold tracking-[0.01em] text-[#f5ede4] transition',
              'hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)]',
              'active:translate-y-0 active:shadow-none',
              'dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]'
            )}
          >
            Go back to sign in
          </button>
        </div>

        <footer className="mt-8 font-mono text-[9px] uppercase tracking-wider text-[#6b5f58] opacity-45 dark:text-[#9b9a92]">
          © 2024 Imminiq. Crafted for the intentional learner.
        </footer>
      </div>
    )
  }

  /* ── Main Form ── */
  return (
    <div
      id="page"
      className={cn(
        'min-h-screen bg-[#f5ede4] text-[#1a1714] font-[DM_Sans,sans-serif]',
        'dark:bg-[#141412] dark:text-[#f2f0eb]',
        'lg:fixed lg:inset-0 lg:flex lg:flex-col lg:overflow-hidden'
      )}
    >
      {/* Mobile Brand Bar */}
      <div className="flex shrink-0 items-center justify-between px-4 pt-5 sm:px-8 sm:pt-7 lg:hidden">
        <Link to="/" className="inline-flex items-center gap-2.5 leading-none">
          <LogoIcon className="h-9 w-9 rounded-[10px] sm:h-10 sm:w-10" />

          <span className="text-[22px] font-bold leading-none tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb] sm:text-2xl">
            immin<span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
            <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
          </span>
        </Link>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-mono text-[8.5px] font-medium uppercase tracking-[0.07em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a] sm:text-[9px]">
          <span className="h-1.25 w-1.25 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
          Step 2 of 2
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* Left Panel */}
        <aside
          className="relative hidden w-1/2 min-w-0 flex-1 overflow-hidden px-14 py-12 lg:flex lg:flex-col lg:justify-between xl:px-18 xl:py-13"
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.09)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.13)_0%,transparent_70%)]" />

          <div className="relative flex flex-col gap-3.5">
            <div className="inline-flex w-fit items-center gap-3 leading-none">
              <LogoIcon className="h-11 w-11 rounded-xl" />

              <span className="text-[26px] font-bold leading-none tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
                immin<span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
                <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
              </span>
            </div>

            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.07em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a]">
              <span className="h-1.25 w-1.25 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
              Almost there — step 2 of 2
            </div>
          </div>

          <div className="relative flex max-w-140 flex-1 flex-col justify-center py-8">
            <p className="font-serif text-[clamp(36px,4vw,54px)] font-extrabold leading-[1.08] tracking-[-1px] text-[#1a1714] dark:text-[#f2f0eb]">
              Secure your
              <br />
              account with
              <br />
              a new key.
            </p>

            <p className="mt-3.5 max-w-107.5 text-[15px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
              Choose a strong password to protect your learning progress,
              streaks, and battle history.
            </p>

            <div className="mt-8 flex flex-col gap-4.5">
              <div className="flex items-start gap-3">
                <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(76,175,125,0.10)] text-[17px] text-[#4caf7d] dark:bg-[rgba(92,201,138,0.12)] dark:text-[#5cc98a]">
                  ✓
                </div>

                <div>
                  <strong className="mb-0.5 block text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                    At least 8 characters
                  </strong>

                  <span className="text-xs leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                    Longer passphrases are harder to crack and easier to
                    remember.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(184,76,43,0.08)] text-[17px] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a]">
                  #
                </div>

                <div>
                  <strong className="mb-0.5 block text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                    Mix letters, numbers, symbols
                  </strong>

                  <span className="text-xs leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                    Complexity multiplies entropy and protects your account.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(184,76,43,0.08)] text-[17px] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a]">
                  🔒
                </div>

                <div>
                  <strong className="mb-0.5 block text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                    Never reuse passwords
                  </strong>

                  <span className="text-xs leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                    A unique password here keeps your scholarly progress safe.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step indicator */}
          <div className="relative flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[rgba(76,175,125,0.12)] font-mono text-[9px] font-semibold text-[#4caf7d] dark:bg-[rgba(92,201,138,0.12)] dark:text-[#5cc98a]">
                ✓
              </span>

              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#6b5f58] dark:text-[#9b9a92]">
                Verify identity
              </span>
            </div>

            <div className="h-px w-6 bg-[#e0d0c5] dark:bg-white/15" />

            <div className="flex items-center gap-2">
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[rgba(184,76,43,0.10)] font-mono text-[9px] font-semibold text-[#b84c2b] dark:bg-[rgba(232,129,106,0.12)] dark:text-[#e8816a]">
                2
              </span>

              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#b84c2b] dark:text-[#e8816a]">
                Set new password
              </span>
            </div>
          </div>
        </aside>

        {/* Right Panel — Form */}
        <div className="flex justify-center px-4 pb-10 pt-4 sm:flex-1 sm:items-center sm:px-8 sm:py-8 lg:w-1/2 lg:min-w-0 lg:px-14 lg:py-7 xl:px-18 xl:py-13">
          <main
            className="flex w-full justify-center sm:items-start lg:items-center"
            aria-label="Set a new password"
          >
            <form
              className={cn(
                'w-full max-w-120 rounded-[20px] border border-[#e0d0c5] bg-[#fdf8f5] px-5 py-7 shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)]',
                'dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.07)]',
                'sm:max-w-125 sm:px-8 sm:py-9',
                'lg:max-h-[calc(100vh-80px)] lg:max-w-120 lg:overflow-y-auto lg:px-9 lg:py-9.5',
                'scrollbar-thin [scrollbar-color:#b84c2b_transparent]',
                'dark:[scrollbar-color:#e8816a_transparent]',
                '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent',
                '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(184,76,43,0.35)]',
                'dark:[&::-webkit-scrollbar-thumb]:bg-[rgba(232,129,106,0.45)]',
                '[&::-webkit-scrollbar-thumb:hover]:bg-[#b84c2b] dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#e8816a]'
              )}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="mb-1.5 text-center font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#9b9a92]">
                Step 2 of 2
              </div>

              <h1 className="mb-1.5 text-center font-serif text-[clamp(22px,5vw,28px)] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                Set a new password
              </h1>

              <p className="mb-5.5 text-center text-[13px] text-[#6b5f58] dark:text-[#9b9a92]">
                Remember it?{' '}
                <Link
                  className="font-medium text-[#b84c2b] hover:underline dark:text-[#e8816a]"
                  to="/login"
                >
                  Sign in instead
                </Link>
              </p>

              {/* API Error Banner */}
              {errors.api && (
                <div
                  className="mb-4.5 flex items-start gap-2.5 rounded-[10px] border border-[rgba(217,69,53,0.2)] border-l-[3px] border-l-[#d94535] bg-[rgba(217,69,53,0.07)] px-3.5 py-3 text-[13px] leading-normal text-[#d94535] dark:border-l-[#ff6b5f] dark:bg-[rgba(255,107,95,0.10)] dark:text-[#ff6b5f]"
                  role="alert"
                >
                  <AlertIcon className="mt-1 h-3.5 w-3.5" />
                  <span>{errors.api}</span>
                </div>
              )}

              {/* New Password */}
              <div className="mb-3.5">
                <label
                  className={cn(labelClass, 'mb-1.5 block')}
                  htmlFor="newPassword"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNew ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={form.newPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                      inputBaseClass(
                        errors.newPassword,
                        touched.newPassword && !errors.newPassword
                      ),
                      'pr-10'
                    )}
                    aria-invalid={!!errors.newPassword}
                    aria-describedby={errors.newPassword ? 'e-newpw' : undefined}
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew((p) => !p)}
                    className={cn(
                      'absolute right-3 top-1/2 flex -translate-y-1/2 items-center rounded p-1 text-[#6b5f58] transition hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]',
                      showNew && 'text-[#b84c2b] dark:text-[#e8816a]'
                    )}
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                    aria-pressed={showNew}
                  >
                    <EyeIcon open={showNew} />
                  </button>
                </div>

                {errors.newPassword && (
                  <div className={errorClass} id="e-newpw" role="alert">
                    <AlertIcon />
                    <span>{errors.newPassword}</span>
                  </div>
                )}
              </div>

              {/* Strength bar */}
              {form.newPassword && (
                <div className="mb-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-mono text-[9.5px] uppercase tracking-widest text-[#6b5f58] dark:text-[#9b9a92]">
                      Strength
                    </span>

                    <span
                      className={cn(
                        'font-mono text-[9.5px] font-semibold uppercase tracking-widest',
                        strength.textClass
                      )}
                    >
                      {strength.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((level) => {
                      const isActive = level <= strength.score

                      return (
                        <div
                          key={level}
                          className={cn(
                            'h-1 rounded-full transition-all duration-300',
                            isActive
                              ? 'bg-[#4caf7d] dark:bg-[#5cc98a]'
                              : 'bg-[#e0d0c5] dark:bg-white/10'
                          )}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="mb-4">
                <label
                  className={cn(labelClass, 'mb-1.5 block')}
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                      inputBaseClass(
                        errors.confirmPassword,
                        touched.confirmPassword &&
                          !errors.confirmPassword &&
                          !!form.confirmPassword
                      ),
                      'pr-10'
                    )}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword ? 'e-confirmpw' : undefined
                    }
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className={cn(
                      'absolute right-3 top-1/2 flex -translate-y-1/2 items-center rounded p-1 text-[#6b5f58] transition hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]',
                      showConfirm && 'text-[#b84c2b] dark:text-[#e8816a]'
                    )}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    aria-pressed={showConfirm}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>

                {errors.confirmPassword && (
                  <div className={errorClass} id="e-confirmpw" role="alert">
                    <AlertIcon />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>

              {/* Password checklist */}
              <div className="mb-5 rounded-[10px] border border-[#e0d0c5] bg-white/60 px-4 py-3.5 dark:border-white/10 dark:bg-white/5">
                <p className="mb-2.5 font-mono text-[9px] uppercase tracking-widest text-[#6b5f58] dark:text-[#9b9a92]">
                  Requirements
                </p>

                <div className="space-y-2">
                  {[
                    { ok: checks.length, label: 'At least 8 characters' },
                    { ok: checks.letter, label: 'At least one letter' },
                    { ok: checks.numberOrSymbol, label: 'One number or symbol' },
                  ].map(({ ok, label }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition',
                          ok
                            ? 'border-[#4caf7d] bg-[#4caf7d] dark:border-[#5cc98a] dark:bg-[#5cc98a]'
                            : 'border-[#e0d0c5] dark:border-white/15'
                        )}
                      >
                        {ok && (
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>

                      <span
                        className={cn(
                          'text-[12px] transition',
                          ok
                            ? 'text-[#1a1714] dark:text-[#f2f0eb]'
                            : 'text-[#9f8f86] dark:text-[#aaa59d]'
                        )}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                className={cn(
                  'relative mt-1 w-full overflow-hidden rounded-[11px] bg-[#b84c2b] p-3.25 text-[15px] font-bold tracking-[0.01em] text-[#f5ede4] transition',
                  'hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)]',
                  'active:translate-y-0 active:shadow-none',
                  'disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none',
                  'dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]'
                )}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting password…' : 'Reset password'}
              </button>

              {/* Trust badges — same as LoginForm */}
              <div className="mt-5 flex flex-wrap justify-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <svg
                    className="text-[#6b5f58] opacity-50 dark:text-[#9b9a92]"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>

                  <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
                    Secure Reset
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <svg
                    className="text-[#6b5f58] opacity-50 dark:text-[#9b9a92]"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>

                  <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
                    Encrypted
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <svg
                    className="text-[#6b5f58] opacity-50 dark:text-[#9b9a92]"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>

                  <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
                    Link Expires
                  </span>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>

      <footer className="flex shrink-0 flex-col gap-1.5 px-5 py-3.5 text-center font-mono text-[9px] uppercase tracking-wider text-[#6b5f58] opacity-45 dark:text-[#9b9a92] sm:flex-row sm:justify-between sm:px-10 sm:py-4 sm:text-[9.5px] lg:pointer-events-none lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:px-12">
        <span>© 2024 Imminiq. Crafted for the intentional learner.</span>

        <div className="flex flex-wrap justify-center gap-4 lg:pointer-events-auto">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </footer>
    </div>
  )
}