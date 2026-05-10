import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRegister } from '../../../hooks/auth/useRegister'
import '../styles/RegisterPage.css'

interface FormState {
  fullName: string
  identifier: string
  password: string
  confirmPassword: string
  terms: boolean
}

interface FormErrors {
  fullName?: string
  identifier?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

const getPasswordStrength = (val: string) => {
  if (!val) return { level: 0, label: '', color: '', cls: '' }

  let score = 0

  if (val.length >= 8) score++
  if (val.length >= 12) score++
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++
  if (/[0-9]/.test(val)) score++
  if (/[^A-Za-z0-9]/.test(val)) score++

  const level = Math.min(4, Math.max(1, score))

  const labels = ['', 'Weak', 'Fair', 'Medium', 'Strong']
  const colors = ['', '#ff6b5f', '#f0a842', '#e8c14a', '#5cc98a']
  const classes = ['', 'weak', 'fair', 'medium', 'strong']

  return {
    level,
    label: labels[level],
    color: colors[level],
    cls: classes[level],
  }
}

const validateIdentifier = (value: string) => {
  const trimmedValue = value.trim()

  if (!trimmedValue) return 'Email or phone number is required.'

  const looksLikePhone = /^[+\d][\d\s\-()]{6,}$/.test(trimmedValue)

  if (looksLikePhone) {
    const digitsOnly = trimmedValue.replace(/\D/g, '')

    if (digitsOnly.length < 7) return 'Phone number seems too short.'
    if (digitsOnly.length > 15) return 'Phone number is too long.'

    return null
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  if (!emailRegex.test(trimmedValue)) {
    return 'Enter a valid email address or phone number.'
  }

  return null
}

const validateField = (
  name: keyof FormState,
  value: string | boolean,
  password?: string
): string | undefined => {
  switch (name) {
    case 'fullName': {
      const trimmedValue = (value as string).trim()

      if (!trimmedValue) return 'Full name is required.'
      if (trimmedValue.length < 3) return 'Name must be at least 3 characters.'
      if (!/[a-zA-Z]/.test(trimmedValue)) return 'Name must contain letters.'
      if (trimmedValue.length > 80) return 'Name is too long.'

      return undefined
    }

    case 'identifier':
      return validateIdentifier(value as string) || undefined

    case 'password': {
      const passwordValue = value as string

      if (!passwordValue) return 'Password is required.'
      if (passwordValue.length < 8) return 'Password must be at least 8 characters.'
      if (passwordValue.length > 128) return 'Password is too long.'
      if (!/[a-zA-Z]/.test(passwordValue)) return 'Must include at least one letter.'
      if (!/[0-9\W]/.test(passwordValue)) return 'Must include a number or symbol.'

      return undefined
    }

    case 'confirmPassword':
      if (!value) return 'Please confirm your password.'
      if (value !== password) return "Passwords don't match."

      return undefined

    case 'terms':
      if (!value) return 'You must agree to continue.'

      return undefined

    default:
      return undefined
  }
}

export default function RegisterForm() {
  const { mutate: register, isPending, error } = useRegister()

  const apiError = error?.response?.data?.message

  const [form, setForm] = useState<FormState>({
    fullName: '',
    identifier: '',
    password: '',
    confirmPassword: '',
    terms: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showPw, setShowPw] = useState(false)
  const [showCpw, setShowCpw] = useState(false)

  const strength = getPasswordStrength(form.password)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    const fieldName = name as keyof FormState
    const fieldValue = type === 'checkbox' ? checked : value

    setForm((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }))

    if (touched[name]) {
      const errorMessage = validateField(
        fieldName,
        fieldValue,
        fieldName === 'confirmPassword' ? form.password : undefined
      )

      setErrors((prev) => ({
        ...prev,
        [fieldName]: errorMessage,
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    const fieldName = name as keyof FormState
    const fieldValue = type === 'checkbox' ? checked : value

    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }))

    const errorMessage = validateField(
      fieldName,
      fieldValue,
      fieldName === 'confirmPassword' ? form.password : undefined
    )

    setErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const fields: (keyof FormState)[] = [
      'fullName',
      'identifier',
      'password',
      'confirmPassword',
      'terms',
    ]

    const newErrors: FormErrors = {}

    fields.forEach((field) => {
      const errorMessage = validateField(
        field,
        field === 'terms' ? form.terms : form[field],
        field === 'confirmPassword' ? form.password : undefined
      )

      if (errorMessage) {
        newErrors[field] = errorMessage
      }
    })

    setErrors(newErrors)

    setTouched({
      fullName: true,
      identifier: true,
      password: true,
      confirmPassword: true,
      terms: true,
    })

    if (Object.keys(newErrors).length > 0) return

    register({
      fullName: form.fullName.trim(),
      identifier: form.identifier.trim(),
      password: form.password,
    })
  }

  return (
    <div className="page-wrapper" id="page">
      {/* Mobile Brand Bar */}
      <div className="mobile-brand" aria-hidden="true">
        <div className="mobile-logo">
          <svg
            className="mobile-logo-icon"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
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

          <span className="mobile-logo-text">
            immin<span className="iq">iq</span>
            <span className="dot">.</span>
          </span>
        </div>

        <div className="mobile-badge">Onboarding now</div>
      </div>

      <div className="content-area">
        {/* Left Panel */}
        <div className="left" aria-hidden="true">
          <div className="brand">
            <div className="logo">
              <svg
                className="logo-icon"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
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

              <span className="logo-text">
                immin<span className="iq">iq</span>
                <span className="dot">.</span>
              </span>
            </div>

            <div className="badge">Now onboarding ambitious learners</div>
          </div>

          <div className="hero">
            <p className="hero-heading">
              Start learning.
              <br />
              Build your path.
              <br />
              Prove it.
            </p>

            <p className="hero-desc">
              AI builds your roadmap, you master the skills, then challenge others
              in 1v1 battles to prove what you know.
            </p>

            <div className="features">
              <div className="feature">
                <div className="feature-icon" aria-hidden="true">
                  ✦
                </div>
                <div className="feature-text">
                  <strong>AI Roadmaps</strong>
                  <span>Personalized paths carved from scholarly datasets.</span>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon" aria-hidden="true">
                  ⚔
                </div>
                <div className="feature-text">
                  <strong>1v1 Skill Battles</strong>
                  <span>Real-time intellectual duels to validate your mastery.</span>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon" aria-hidden="true">
                  ↗
                </div>
                <div className="feature-text">
                  <strong>Streaks &amp; Progress</strong>
                  <span>Visual proof of your daily intellectual commitment.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="social-proof">
            <div className="avatars" aria-hidden="true">
              <div className="avatar" style={{ background: '#c4654e' }}>
                AS
              </div>
              <div className="avatar" style={{ background: '#4caf7d' }}>
                ML
              </div>
              <div className="avatar" style={{ background: '#5b8de8' }}>
                RK
              </div>
            </div>
            <p>Joined by 2,400+ scholars this week</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right">
          <main className="form-main" aria-label="Create your Imminiq account">
            <form className="card" onSubmit={handleSubmit} noValidate>
              <div className="card-label fade-up">Create Account</div>

              <h1 className="card-title fade-up">Join Imminiq</h1>

              <p className="card-sub fade-up">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>

              {/* API Error */}
              {apiError && (
                <div className="api-error" role="alert">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {apiError}
                </div>
              )}

              {/* OAuth */}
              <div className="oauth-row fade-up">
                <button
                  className="oauth-btn"
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
                  className="oauth-btn"
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

              <div className="divider fade-up">
                <span>or continue with credentials</span>
              </div>

              {/* Full Name */}
              <div className={`field fade-up${errors.fullName ? ' has-error' : ''}`} id="f-name">
                <div className="field-header">
                  <label htmlFor="fullname">Full Name</label>
                </div>

                <div className="field-wrap">
                  <input
                    type="text"
                    id="fullname"
                    name="fullName"
                    placeholder="E.g. Alexander von Humboldt"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.fullName
                        ? 'is-error'
                        : touched.fullName && !errors.fullName
                          ? 'is-valid'
                          : ''
                    }
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? 'e-name' : undefined}
                  />
                </div>

                {errors.fullName && (
                  <div className="err-msg" id="e-name" role="alert" style={{ display: 'flex' }}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{errors.fullName}</span>
                  </div>
                )}
              </div>

              {/* Identifier */}
              <div
                className={`field fade-up${errors.identifier ? ' has-error' : ''}`}
                id="f-identifier"
              >
                <div className="field-header">
                  <label htmlFor="identifier">Email or Phone Number</label>
                </div>

                <div className="field-wrap">
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    placeholder="scholar@university.edu or +91 98765 43210"
                    autoComplete="username"
                    inputMode="text"
                    value={form.identifier}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.identifier
                        ? 'is-error'
                        : touched.identifier && !errors.identifier
                          ? 'is-valid'
                          : ''
                    }
                    aria-invalid={!!errors.identifier}
                    aria-describedby="hint-identifier e-identifier"
                  />
                </div>

                <p className="hint" id="hint-identifier">
                  We'll detect email vs. phone automatically.
                </p>

                {errors.identifier && (
                  <div
                    className="err-msg"
                    id="e-identifier"
                    role="alert"
                    style={{ display: 'flex' }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{errors.identifier}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className={`field fade-up${errors.password ? ' has-error' : ''}`} id="f-pw">
                <div className="field-header">
                  <label htmlFor="password">Password</label>
                </div>

                <div className="field-wrap has-pw-toggle">
                  <input
                    type={showPw ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="8+ chars, letters + numbers"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.password
                        ? 'is-error'
                        : touched.password && !errors.password
                          ? 'is-valid'
                          : ''
                    }
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'e-pw' : undefined}
                  />

                  <button
                    className={`pw-toggle${showPw ? ' active' : ''}`}
                    type="button"
                    onClick={() => setShowPw((prev) => !prev)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    aria-pressed={showPw}
                  >
                    {showPw ? (
                      <svg
                        className="icon-eye-off"
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
                        className="icon-eye"
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

                {/* Strength Bar */}
                {form.password && (
                  <div className="strength-bar" aria-hidden="true">
                    <div className="strength-segs">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className={`seg${item <= strength.level ? ` ${strength.cls}` : ''}`}
                        />
                      ))}
                    </div>

                    <span className="strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}

                {errors.password && (
                  <div className="err-msg" id="e-pw" role="alert" style={{ display: 'flex' }}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div
                className={`field fade-up${errors.confirmPassword ? ' has-error' : ''}`}
                id="f-cpw"
              >
                <div className="field-header">
                  <label htmlFor="confirm-password">Confirm Password</label>
                </div>

                <div className="field-wrap has-pw-toggle">
                  <input
                    type={showCpw ? 'text' : 'password'}
                    id="confirm-password"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.confirmPassword
                        ? 'is-error'
                        : touched.confirmPassword && !errors.confirmPassword
                          ? 'is-valid'
                          : ''
                    }
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'e-cpw' : undefined}
                  />

                  <button
                    className={`pw-toggle${showCpw ? ' active' : ''}`}
                    type="button"
                    onClick={() => setShowCpw((prev) => !prev)}
                    aria-label={showCpw ? 'Hide password' : 'Show password'}
                    aria-pressed={showCpw}
                  >
                    {showCpw ? (
                      <svg
                        className="icon-eye-off"
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
                        className="icon-eye"
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

                {errors.confirmPassword && (
                  <div className="err-msg" id="e-cpw" role="alert" style={{ display: 'flex' }}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="terms-block fade-up">
                <div className={`checkbox-row${errors.terms ? ' has-error' : ''}`} id="f-terms">
                  <div className="checkbox-wrap">
                    <input
                      type="checkbox"
                      id="terms"
                      name="terms"
                      checked={form.terms}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-describedby={errors.terms ? 'e-terms' : undefined}
                    />
                    <div className="checkbox-custom" aria-hidden="true" />
                  </div>

                  <label htmlFor="terms">
                    I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                    <Link to="/privacy">Scholarly Privacy Policy</Link>.
                  </label>
                </div>

                {errors.terms && (
                  <div className="terms-err show" id="e-terms" role="alert">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{errors.terms}</span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button className="cta-btn fade-up" type="submit" disabled={isPending}>
                <span className="btn-shimmer" aria-hidden="true" />
                {isPending ? 'Creating account...' : 'Create account'}
              </button>

              {/* Trust Row */}
              <div className="trust-row fade-up">
                <div className="trust-item">
                  <svg
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
                  <span>Secure Auth</span>
                </div>

                <div className="trust-item">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>OAuth Support</span>
                </div>

                <div className="trust-item">
                  <svg
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
                  <span>Dual Method</span>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="page-footer">
        <span>© 2024 Imminiq. Crafted for the intentional learner.</span>

        <div className="footer-links">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Institutional Access</span>
        </div>
      </footer>
    </div>
  )
}