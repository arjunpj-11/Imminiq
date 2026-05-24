import { useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useForgotPassword } from '../../../hooks/auth/useForgotPassword'
import AuthLayout from './AuthLayout'
import { ApiErrorBanner, FieldError } from './AuthError'
import { authInputClass, authLabelClass } from '../utils/auth-ui'
import { validateIdentifier } from '../utils/auth-validation'

interface FormState {
  identifier: string
}

interface FormErrors {
  identifier?: string
}

export default function ForgotPasswordForm() {
  const navigate = useNavigate()
  const { mutate: forgotPassword, isPending, error } = useForgotPassword()
  const apiError = error?.response?.data?.message || (error ? 'Failed to send reset code. Please try again.' : '')

  const [form, setForm] = useState<FormState>({ identifier: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))

    if (touched[name]) {
      setErrors((current) => ({ ...current, [name]: validateIdentifier(value) }))
    }
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setTouched((current) => ({ ...current, [name]: true }))
    setErrors((current) => ({ ...current, [name]: validateIdentifier(value) }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const identifierError = validateIdentifier(form.identifier)
    setErrors({ identifier: identifierError })
    setTouched({ identifier: true })

    if (identifierError) return

    const trimmedIdentifier = form.identifier.trim()

    sessionStorage.removeItem('otp_expiry')
    sessionStorage.removeItem('otp_resend_expiry')

    forgotPassword(
      { identifier: trimmedIdentifier },
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

  return (
    <AuthLayout
      badge="Password Recovery"
      title="Reset your password"
      subtitle="Enter your email or phone number and we'll send you a 6-digit reset code."
    >
      <ApiErrorBanner message={apiError} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <label className="block">
          <span className={authLabelClass}>Email or phone</span>
          <input
            className={authInputClass(errors.identifier, touched.identifier && !errors.identifier)}
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="you@example.com"
            autoComplete="username"
          />
          <FieldError message={errors.identifier} />
        </label>

        <button className="relative mt-1 w-full overflow-hidden rounded-[11px] bg-[#b84c2b] p-3.25 text-[15px] font-bold tracking-[0.01em] text-[#f5ede4] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]" type="submit" disabled={isPending}>
          {isPending ? 'Sending code…' : 'Send reset code'}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#6b5f58] dark:text-[#9b9a92]">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-[#b84c2b] hover:opacity-70 dark:text-[#e8816a]">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  )
}
