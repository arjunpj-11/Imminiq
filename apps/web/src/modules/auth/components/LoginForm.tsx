import { useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

import { useLogin } from '../hooks/useLogin'
import AuthLayout from './AuthLayout'
import AuthIdentifierField from './AuthIdentifierField'
import AuthSocialButtons from './AuthSocialButtons'
import { ApiErrorBanner, FieldError } from './AuthError'
import { EyeIcon } from './icons/AuthIcons'
import { authInputClass, authLabelClass, cn } from '../utils/auth-ui'
import { validateIdentifier } from '../utils/auth-validation'

interface IFormState {
  identifier: string
  password: string
  rememberMe: boolean
}

interface IFormErrors {
  identifier?: string
  password?: string
}

const validateField = (
  name: keyof IFormState,
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

export default function LoginForm() {
  const { mutate: login, isPending, error } = useLogin()

  const apiError = axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message
    : undefined

  const tooManyAttempts = axios.isAxiosError(error)
    ? error.response?.status === 429
    : false

  const [form, setForm] = useState<IFormState>({
    identifier: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<IFormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showPw, setShowPw] = useState(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    const fieldName = name as keyof IFormState
    const fieldValue = type === 'checkbox' ? checked : value

    setForm((current) => ({ ...current, [fieldName]: fieldValue }))

    if (touched[name]) {
      setErrors((current) => ({
        ...current,
        [fieldName]: validateField(fieldName, fieldValue),
      }))
    }
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    const fieldName = name as keyof IFormState
    const fieldValue = type === 'checkbox' ? checked : value

    setTouched((current) => ({ ...current, [fieldName]: true }))
    setErrors((current) => ({
      ...current,
      [fieldName]: validateField(fieldName, fieldValue),
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newErrors: IFormErrors = {}

    ;(['identifier', 'password'] as const).forEach((field) => {
      const message = validateField(field, form[field])
      if (message) newErrors[field] = message
    })

    setErrors(newErrors)
    setTouched({ identifier: true, password: true })

    if (Object.keys(newErrors).length > 0) return

    login({
      identifier: form.identifier.trim(),
      password: form.password,
      rememberMe: form.rememberMe,
    })
  }

  return (
    <AuthLayout
      badge="Welcome back"
      title="Sign in to Imminiq"
      subtitle="Continue your personalized learning journey."
    >
      <ApiErrorBanner message={apiError} warning={tooManyAttempts} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthIdentifierField
          value={form.identifier}
          error={errors.identifier}
          valid={Boolean(touched.identifier && !errors.identifier)}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <label className="block">
          <div className="mb-1.5 flex items-center justify-between">
            <span className={authLabelClass}>Password</span>
            <Link to="/forgot-password" className="font-mono text-[9.5px] uppercase tracking-widest text-(--brand-500) hover:opacity-70 dark:text-(--brand-500)">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              className={cn(authInputClass(errors.password, touched.password && !errors.password), 'pr-11')}
              type={showPw ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-secondary) transition hover:text-(--brand-500) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
              onClick={() => setShowPw((value) => !value)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>
          <FieldError message={errors.password} />
        </label>

        <label className="flex items-center gap-2 text-[12.5px] text-(--text-secondary) dark:text-(--text-secondary)">
          <input
            type="checkbox"
            name="rememberMe"
            checked={form.rememberMe}
            onChange={handleChange}
            className="accent-(--brand-500) dark:accent-(--brand-500)"
          />
          Remember this device
        </label>

        <button
          className="relative mt-1 w-full overflow-hidden rounded-md bg-(--brand-500) p-3.25 text-[15px] font-bold tracking-[0.01em] text-[#f5ede4] transition hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          type="submit"
          disabled={isPending}
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-(--border-subtle) dark:bg-white/15" />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--text-secondary) opacity-60 dark:text-(--text-secondary)">
          Or continue with
        </span>
        <div className="h-px flex-1 bg-(--border-subtle) dark:bg-white/15" />
      </div>

      <AuthSocialButtons />

      <p className="mt-6 text-center text-[13px] text-(--text-secondary) dark:text-(--text-secondary)">
        New to Imminiq?{' '}
        <Link to="/register" className="font-semibold text-(--brand-500) hover:opacity-70 dark:text-(--brand-500)">
          Create account
        </Link>
      </p>
    </AuthLayout>
  )
}
