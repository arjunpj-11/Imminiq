import axios from 'axios';

export interface IApiErrorPayload {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

const ERROR_MESSAGES: Record<string, string> = {
  INTERNAL_ERROR: 'Something went wrong on our side. Please try again.',
  NETWORK_ERROR: 'Unable to reach the server. Check your connection and try again.',
  VALIDATION_ERROR: 'Please check the highlighted information and try again.',
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  CSRF_TOKEN_INVALID: 'Your secure session expired. Refresh the page and try again.',
};

const firstFieldError = (errors?: Record<string, string[]>): string | undefined => {
  if (!errors) return undefined;

  for (const messages of Object.values(errors)) {
    const message = messages.find((item) => item.trim().length > 0);
    if (message) return message;
  }

  return undefined;
};

export const getUserFacingError = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  if (!axios.isAxiosError<IApiErrorPayload>(error)) {
    return fallback;
  }

  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  const { status, data } = error.response;
  const definedMessage = data?.code ? ERROR_MESSAGES[data.code] : undefined;

  if (definedMessage) {
    if (data.code === 'VALIDATION_ERROR') {
      return firstFieldError(data.errors) ?? definedMessage;
    }

    return definedMessage;
  }

  // Operational 4xx messages are authored by the API and safe for users.
  if (
    status >= 400 &&
    status < 500 &&
    typeof data?.message === 'string' &&
    data.message.trim().length > 0 &&
    data.message.length <= 300
  ) {
    return data.message.trim();
  }

  return fallback;
};

export const getValidationErrors = (error: unknown): Record<string, string[]> => {
  if (!axios.isAxiosError<IApiErrorPayload>(error)) return {};
  return error.response?.data?.errors ?? {};
};
