import type { ChangeEventHandler, FocusEventHandler } from 'react'

import { authInputClass, authLabelClass } from '../utils/auth-ui'
import { FieldError } from './AuthError'

interface IAuthIdentifierFieldProps {
  value: string
  error?: string
  valid?: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
  onBlur: FocusEventHandler<HTMLInputElement>
}

export default function AuthIdentifierField({
  value,
  error,
  valid = false,
  onChange,
  onBlur,
}: IAuthIdentifierFieldProps) {
  return (
    <label className="block">
      <span className={authLabelClass}>Email or phone</span>
      <input
        className={authInputClass(error, valid)}
        name="identifier"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="you@example.com"
        autoComplete="username"
      />
      <FieldError message={error} />
    </label>
  )
}
