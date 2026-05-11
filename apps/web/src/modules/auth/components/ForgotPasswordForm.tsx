import { useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForgotPassword } from '../../../hooks/auth/useForgotPassword'

interface FormState {
  identifier: string
}

interface FormErrors {
  identifier?: string
}

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(' ')
}

const validateIdentifier = (value: string): string | undefined => {
  const trimmed = value.trim()

  if (!trimmed) return 'Email or phone number is required.'

  const looksLikePhone = /^[+\d][\d\s\-()]{6,}$/.test(trimmed)

  if (looksLikePhone) {
    const digits = trimmed.replace(/\D/g, '')

    if (digits.length < 7) return 'Phone number seems too short.'
    if (digits.length > 15) return 'Phone number is too long.'

    return undefined
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  if (!emailRegex.test(trimmed)) {
    return 'Enter a valid email address or phone number.'
  }

  return undefined
}

const LogoIcon = ({ className = '' }: { className?: string }) => {
  return (
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
}

const AlertIcon = ({ className = '' }: { className?: string }) => {
  return (
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
}

export default function ForgotPasswordForm() {
  const navigate = useNavigate()

  const {
    mutate: forgotPassword,
    isPending,
    error,
  } = useForgotPassword()

  const apiError =
    error?.response?.data?.message ||
    (error ? 'Failed to send reset code. Please try again.' : '')

  const [form, setForm] = useState<FormState>({
    identifier: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateIdentifier(value),
      }))
    }
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    setErrors((prev) => ({
      ...prev,
      [name]: validateIdentifier(value),
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const identifierError = validateIdentifier(form.identifier)

    setErrors({
      identifier: identifierError,
    })

    setTouched({
      identifier: true,
    })

    if (identifierError) return

    const trimmedIdentifier = form.identifier.trim()

    sessionStorage.removeItem('otp_expiry')
    sessionStorage.removeItem('otp_resend_expiry')

    forgotPassword(
      {
        identifier: trimmedIdentifier,
      },
      {
        onSuccess: (data) => {
          navigate('/verify-account', {
            replace: true,
            state: {
              identifier: data.data?.verificationTarget || trimmedIdentifier,
              method: data.data?.verificationMethod,
              purpose: 'password_reset',
              from: 'forgot-password',
            },
          })
        },
      }
    )
  }

  const inputClass = (error?: string, valid?: boolean) =>
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

  const labelClass =
    'font-mono text-[9.5px] font-medium uppercase tracking-[0.1em] text-[#1a1714] dark:text-[#f2f0eb]'

  const errorClass =
    'mt-1.5 flex items-center gap-1.5 text-[11.5px] leading-normal text-[#d94535] dark:text-[#ff6b5f]'

  return (
    <div
      id="forgot-page"
      className={cn(
        'flex min-h-screen flex-col bg-[#f5ede4] text-[#1a1714] font-[DM_Sans,sans-serif]',
        'dark:bg-[#141412] dark:text-[#f2f0eb]'
      )}
    >
      <header className="flex shrink-0 items-center justify-between px-5 pt-5 sm:px-10 sm:pt-7">
        <Link to="/" className="inline-flex items-center gap-2.5 leading-none">
          <LogoIcon className="h-9 w-9 rounded-[10px]" />

          <span className="text-[22px] font-bold leading-none tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
            immin<span className="text-[#b84c2b] dark:text-[#e8816a]">iq</span>
            <span className="text-[#b84c2b] dark:text-[#e8816a]">.</span>
          </span>
        </Link>

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[#6b5f58] transition hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to sign in
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.10)_0%,transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative w-full max-w-120">
          <div
            className={cn(
              'w-full rounded-[20px] border border-[#e0d0c5] bg-[#fdf8f5] px-5 py-8 shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)]',
              'dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.07)]',
              'sm:px-9 sm:py-10'
            )}
          >
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-5 flex justify-center">
                <div className="flex h-15 w-15 items-center justify-center rounded-full bg-[rgba(184,76,43,0.08)] dark:bg-[rgba(232,129,106,0.10)]">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#b84c2b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="dark:stroke-[#e8816a]"
                    aria-hidden="true"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </div>
              </div>

              <div className="mb-1.5 text-center font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#9b9a92]">
                Password Recovery
              </div>

              <h1 className="mb-2 text-center font-serif text-[clamp(22px,5vw,28px)] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                Reset your password
              </h1>

              <p className="mb-7 text-center text-[13px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
                Enter your email or phone number and we&apos;ll
                <br className="hidden sm:block" /> send you a 6-digit reset code.
              </p>

              {apiError && (
                <div
                  className="mb-4.5 flex items-start gap-2.5 rounded-[10px] border border-[rgba(217,69,53,0.2)] border-l-[3px] border-l-[#d94535] bg-[rgba(217,69,53,0.07)] px-3.5 py-3 text-[13px] leading-normal text-[#d94535] dark:border-l-[#ff6b5f] dark:bg-[rgba(255,107,95,0.10)] dark:text-[#ff6b5f]"
                  role="alert"
                  key={apiError}
                >
                  <AlertIcon className="mt-1 h-3.5 w-3.5" />
                  <span>{apiError}</span>
                </div>
              )}

              <div className="mb-5">
                <label
                  className={cn(labelClass, 'mb-1.5 block')}
                  htmlFor="identifier"
                >
                  Email or Phone Number
                </label>

                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="arjun@example.com or +91 98765 43210"
                  autoComplete="username"
                  inputMode="text"
                  value={form.identifier}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass(
                    errors.identifier,
                    touched.identifier && !errors.identifier
                  )}
                  aria-invalid={!!errors.identifier}
                  aria-describedby="hint-id e-id"
                />

                <p
                  id="hint-id"
                  className="mt-1.5 flex items-center gap-1.5 text-[11px] italic leading-normal text-[#6b5f58] dark:text-[#9b9a92]"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="shrink-0 opacity-60"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  You can use the email or phone number linked to your account.
                </p>

                {errors.identifier && (
                  <div className={errorClass} id="e-id" role="alert">
                    <AlertIcon />
                    <span>{errors.identifier}</span>
                  </div>
                )}
              </div>

              <button
                className={cn(
                  'relative w-full overflow-hidden rounded-[11px] bg-[#b84c2b] p-3.25 text-[15px] font-bold tracking-[0.01em] text-[#f5ede4] transition',
                  'hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)]',
                  'active:translate-y-0 active:shadow-none',
                  'disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none',
                  'dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]'
                )}
                type="submit"
                disabled={isPending}
              >
                {isPending ? 'Sending code...' : 'Send reset code'}
              </button>

              <p className="mt-5 text-center text-[12px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                Remembered your password?{' '}
                <Link
                  to="/login"
                  className="font-medium text-[#b84c2b] hover:underline dark:text-[#e8816a]"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}