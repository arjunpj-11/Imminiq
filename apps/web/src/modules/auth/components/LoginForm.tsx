import { useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../../../components/ui/ThemeToggle'
import { useLogin } from '../../../hooks/auth/useLogin'

interface FormState {
  identifier: string
  password: string
  rememberMe: boolean
}

interface FormErrors {
  identifier?: string
  password?: string
}

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(' ')
}

const validateIdentifier = (value: string) => {
  const trimmedValue = value.trim()

  if (!trimmedValue) return 'Email or phone number is required.'

  const looksLikePhone = /^[+\d][\d\s\-()]{6,}$/.test(trimmedValue)

  if (looksLikePhone) {
    const digitsOnly = trimmedValue.replace(/\D/g, '')

    if (digitsOnly.length < 7) return 'Phone number seems too short.'
    if (digitsOnly.length > 15) return 'Phone number is too long.'

    return undefined
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  if (!emailRegex.test(trimmedValue)) {
    return 'Enter a valid email address or phone number.'
  }

  return undefined
}

const validateField = (
  name: keyof FormState,
  value: string | boolean
): string | undefined => {
  switch (name) {
    case 'identifier':
      return validateIdentifier(value as string)

    case 'password':
      if (!value) return 'Password is required.'
      return undefined

    default:
      return undefined
  }
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

const WarningIcon = ({ className = '' }: { className?: string }) => {
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
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export default function LoginForm() {
  const { mutate: login, isPending, error } = useLogin()

  const loginError = error as any
  const apiError = loginError?.response?.data?.message
  const tooManyAttempts = loginError?.response?.status === 429

  const [form, setForm] = useState<FormState>({
    identifier: '',
    password: '',
    rememberMe: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showPw, setShowPw] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    const fieldName = name as keyof FormState
    const fieldValue = type === 'checkbox' ? checked : value

    setForm((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }))

    if (touched[name]) {
      const errorMessage = validateField(fieldName, fieldValue)

      setErrors((prev) => ({
        ...prev,
        [fieldName]: errorMessage,
      }))
    }
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    const fieldName = name as keyof FormState
    const fieldValue = type === 'checkbox' ? checked : value

    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }))

    const errorMessage = validateField(fieldName, fieldValue)

    setErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const fields: (keyof FormState)[] = ['identifier', 'password']
    const newErrors: FormErrors = {}

    fields.forEach((field) => {
      const errorMessage = validateField(field, form[field])

      if (errorMessage) {
        newErrors[field] = errorMessage
      }
    })

    setErrors(newErrors)

    setTouched({
      identifier: true,
      password: true,
    })

    if (Object.keys(newErrors).length > 0) return

    login({
      identifier: form.identifier.trim(),
      password: form.password,
      rememberMe: form.rememberMe,
    })
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
      id="page"
      className={cn(
        'min-h-screen bg-[#f5ede4] text-[#1a1714] [font-family:DM_Sans,sans-serif]',
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
          <span className="h-[5px] w-[5px] rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
          Welcome back
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* Left Panel */}
        <aside
          className="relative hidden w-1/2 min-w-0 flex-1 overflow-hidden px-14 py-12 lg:flex lg:flex-col lg:justify-between xl:px-[72px] xl:py-[52px]"
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

            <ThemeToggle />

            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.07em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a]">
              <span className="h-[5px] w-[5px] rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
              Welcome back, keep building
            </div>
          </div>

          <div className="relative flex max-w-[560px] flex-1 flex-col justify-center py-8">
            <p className="font-serif text-[clamp(36px,4vw,54px)] font-extrabold leading-[1.08] tracking-[-1px] text-[#1a1714] dark:text-[#f2f0eb]">
              Welcome back.
              <br />
              Your roadmap
              <br />
              awaits.
            </p>

            <p className="mt-3.5 max-w-[430px] text-[15px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
              Continue your learning path, resume your streaks, and jump back
              into battles that prove what you know.
            </p>

            <div className="mt-8 flex flex-col gap-[18px]">
              <div className="flex items-start gap-3">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[rgba(76,175,125,0.10)] text-[17px] text-[#4caf7d] dark:bg-[rgba(92,201,138,0.12)] dark:text-[#5cc98a]">
                  ✓
                </div>
                <div>
                  <strong className="mb-0.5 block text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                    Pick Up Where You Left Off
                  </strong>
                  <span className="text-xs leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                    Your progress, streaks, and roadmap are saved automatically.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[rgba(184,76,43,0.08)] text-[17px] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a]">
                  ⚔
                </div>
                <div>
                  <strong className="mb-0.5 block text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                    Jump Into Battles
                  </strong>
                  <span className="text-xs leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                    Challenge others in live 1v1 duels to validate your mastery.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[rgba(184,76,43,0.08)] text-[17px] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.09)] dark:text-[#e8816a]">
                  ↗
                </div>
                <div>
                  <strong className="mb-0.5 block text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                    Keep Your Streak Alive
                  </strong>
                  <span className="text-xs leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                    Daily consistency compounds into intellectual excellence.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex flex-wrap items-center gap-2.5">
            <div className="flex">
              <div className="-mr-2 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-[#f5ede4] bg-[#c4654e] font-mono text-[9px] font-semibold text-white dark:border-[#141412]">
                AS
              </div>
              <div className="-mr-2 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-[#f5ede4] bg-[#4caf7d] font-mono text-[9px] font-semibold text-white dark:border-[#141412]">
                ML
              </div>
              <div className="-mr-2 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-[#f5ede4] bg-[#5b8de8] font-mono text-[9px] font-semibold text-white dark:border-[#141412]">
                RK
              </div>
            </div>

            <p className="pl-2.5 font-mono text-[11px] uppercase leading-tight tracking-[0.03em] text-[#6b5f58] dark:text-[#9b9a92]">
              Joined by 2,400+ scholars this week
            </p>
          </div>
        </aside>

        {/* Right Panel */}
        <div className="flex justify-center px-4 pb-10 pt-4 sm:flex-1 sm:items-center sm:px-8 sm:py-8 lg:w-1/2 lg:min-w-0 lg:px-14 lg:py-7 xl:px-[72px] xl:py-[52px]">
          <main
            className="flex w-full justify-center sm:items-start lg:items-center"
            aria-label="Sign in to your Imminiq account"
          >
            <form
              className={cn(
                'w-full max-w-[480px] rounded-[20px] border border-[#e0d0c5] bg-[#fdf8f5] px-5 py-7 shadow-[0_6px_32px_rgba(26,23,20,0.07),0_1px_6px_rgba(26,23,20,0.04)]',
                'dark:border-white/15 dark:bg-[#1e1c19] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(232,129,106,0.07)]',
                'sm:max-w-[500px] sm:px-8 sm:py-9',
                'lg:max-h-[calc(100vh-80px)] lg:max-w-[480px] lg:overflow-y-auto lg:px-9 lg:py-[38px]',

                // themed scrollbar
                '[scrollbar-width:thin] [scrollbar-color:#b84c2b_transparent]',
                'dark:[scrollbar-color:#e8816a_transparent]',
                '[&::-webkit-scrollbar]:w-1.5',
                '[&::-webkit-scrollbar-track]:bg-transparent',
                '[&::-webkit-scrollbar-thumb]:rounded-full',
                '[&::-webkit-scrollbar-thumb]:bg-[rgba(184,76,43,0.35)]',
                'dark:[&::-webkit-scrollbar-thumb]:bg-[rgba(232,129,106,0.45)]',
                '[&::-webkit-scrollbar-thumb:hover]:bg-[#b84c2b]',
                'dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#e8816a]'
              )}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="mb-1.5 text-center font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#9b9a92]">
                Sign In
              </div>

              <h1 className="mb-1.5 text-center font-serif text-[clamp(22px,5vw,28px)] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                Access your account
              </h1>

              <p className="mb-[22px] text-center text-[13px] text-[#6b5f58] dark:text-[#9b9a92]">
                Don&apos;t have an account?{' '}
                <Link
                  className="font-medium text-[#b84c2b] hover:underline dark:text-[#e8816a]"
                  to="/register"
                >
                  Create one
                </Link>
              </p>

              {apiError && (
                <div
                  className="mb-[18px] flex items-start gap-2.5 rounded-[10px] border border-[rgba(217,69,53,0.2)] border-l-[3px] border-l-[#d94535] bg-[rgba(217,69,53,0.07)] px-3.5 py-3 text-[13px] leading-normal text-[#d94535] dark:border-l-[#ff6b5f] dark:bg-[rgba(255,107,95,0.10)] dark:text-[#ff6b5f]"
                  role="alert"
                  key={apiError}
                >
                  <AlertIcon className="mt-1 h-3.5 w-3.5" />
                  <span>{apiError}</span>
                </div>
              )}

              {tooManyAttempts && (
                <div
                  className="mb-[18px] flex items-start gap-2.5 rounded-[10px] border border-[rgba(176,112,18,0.2)] border-l-[3px] border-l-[#b07012] bg-[rgba(240,165,0,0.07)] px-3.5 py-3 text-[13px] leading-normal text-[#9a650b] dark:border-l-[#f0a842] dark:bg-[rgba(240,168,66,0.10)] dark:text-[#f0a842]"
                  role="alert"
                >
                  <WarningIcon className="mt-1 h-3.5 w-3.5" />
                  <span>Too many attempts. Your account will be locked for 5 minutes.</span>
                </div>
              )}

              <div className="mb-5 grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2">
                <button
                  className="flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-white px-2 py-[11px] text-[13px] font-medium text-[#1a1714] transition hover:-translate-y-px hover:border-[#e8816a] hover:shadow-[0_2px_10px_rgba(184,76,43,0.08)] active:translate-y-0 dark:border-white/15 dark:bg-[#252320] dark:text-[#f2f0eb]"
                  type="button"
                  aria-label="Continue with Google"
                  onClick={() => {
                    window.location.href = `${import.meta.env.VITE_API_URL}/auth/oauth/google`
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>

                <button
                  className="flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-white px-2 py-[11px] text-[13px] font-medium text-[#1a1714] transition hover:-translate-y-px hover:border-[#e8816a] hover:shadow-[0_2px_10px_rgba(184,76,43,0.08)] active:translate-y-0 dark:border-white/15 dark:bg-[#252320] dark:text-[#f2f0eb]"
                  type="button"
                  aria-label="Continue with GitHub"
                  onClick={() => {
                    window.location.href = `${import.meta.env.VITE_API_URL}/auth/oauth/github`
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </button>
              </div>

              <div className="mb-5 flex items-center gap-2.5">
                <div className="h-px flex-1 bg-[#e0d0c5] dark:bg-white/15" />
                <span className="whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.1em] text-[#6b5f58] dark:text-[#9b9a92]">
                  or continue with credentials
                </span>
                <div className="h-px flex-1 bg-[#e0d0c5] dark:bg-white/15" />
              </div>

              {/* Identifier */}
              <div className="mb-3.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className={labelClass} htmlFor="identifier">
                    Email or Phone Number
                  </label>
                </div>

                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="name@example.com or +91 98765 43210"
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
                  aria-describedby="hint-identifier e-identifier"
                />

                <p
                  id="hint-identifier"
                  className="mt-1.5 text-[11px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]"
                >
                  We'll detect email vs. phone automatically.
                </p>

                {errors.identifier && (
                  <div className={errorClass} id="e-identifier" role="alert">
                    <AlertIcon />
                    <span>{errors.identifier}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="mb-3.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className={labelClass} htmlFor="password">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-mono text-[9.5px] font-medium uppercase tracking-[0.1em] text-[#b84c2b] transition hover:underline dark:text-[#e8816a]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                      inputClass(errors.password, touched.password && !errors.password),
                      'pr-10'
                    )}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'e-pw' : undefined}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw((prev) => !prev)}
                    className={cn(
                      'absolute right-3 top-1/2 flex -translate-y-1/2 items-center rounded p-1 text-[#6b5f58] transition hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]',
                      showPw && 'text-[#b84c2b] dark:text-[#e8816a]'
                    )}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    aria-pressed={showPw}
                  >
                    {showPw ? (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
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
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {errors.password && (
                  <div className={errorClass} id="e-pw" role="alert">
                    <AlertIcon />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Remember Me */}
              <div className="mt-4 flex items-center gap-2.5">
                <div className="relative h-[17px] w-[17px] shrink-0">
                  <input
                    className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                  />

                  <div
                    className={cn(
                      'flex h-[17px] w-[17px] items-center justify-center rounded-[5px] border-[1.5px] border-[#e0d0c5] bg-white transition',
                      'peer-focus-visible:shadow-[0_0_0_3px_rgba(184,76,43,0.09)]',
                      'dark:border-white/15 dark:bg-[#252320]',
                      form.rememberMe &&
                        'border-[#b84c2b] bg-[#b84c2b] dark:border-[#e8816a] dark:bg-[#e8816a]'
                    )}
                    aria-hidden="true"
                  >
                    {form.rememberMe && (
                      <span className="h-[8px] w-[5px] rotate-45 border-b-2 border-r-2 border-[#f5ede4] dark:border-[#141412]" />
                    )}
                  </div>
                </div>

                <label
                  className="flex-1 cursor-pointer text-[12.5px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]"
                  htmlFor="rememberMe"
                >
                  Remember me for 30 days
                </label>
              </div>

              <button
                className={cn(
                  'relative mt-4 w-full overflow-hidden rounded-[11px] bg-[#b84c2b] p-[13px] text-[15px] font-bold tracking-[0.01em] text-[#f5ede4] transition',
                  'hover:-translate-y-px hover:bg-[#963d22] hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)]',
                  'active:translate-y-0 active:shadow-none',
                  'disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none',
                  'dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]'
                )}
                type="submit"
                disabled={isPending}
              >
                {isPending ? 'Signing in...' : 'Sign in'}
              </button>

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
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
                    Secure Auth
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
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
                    OAuth Support
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
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
                    Dual Method
                  </span>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>

      <footer className="flex shrink-0 flex-col gap-1.5 px-5 py-3.5 text-center font-mono text-[9px] uppercase tracking-[0.05em] text-[#6b5f58] opacity-45 dark:text-[#9b9a92] sm:flex-row sm:justify-between sm:px-10 sm:py-4 sm:text-[9.5px] lg:pointer-events-none lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:px-12">
        <span>© 2024 Imminiq. Crafted for the intentional learner.</span>

        <div className="flex flex-wrap justify-center gap-4 lg:pointer-events-auto">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Institutional Access</span>
        </div>
      </footer>
    </div>
  )
}