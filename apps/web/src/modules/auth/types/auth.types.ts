export type VerifyPurpose = 'account_verification' | 'password_reset';

export type VerifyState = {
  identifier?: string;
  method?: 'email' | 'phone';
  purpose?: VerifyPurpose;
  from?: 'register' | 'forgot-password';
};

export type AuthApiErrorResponse = {
  message?: string;
};

export type VerificationStatus = 'loading' | 'success' | 'error' | 'missing-token';
