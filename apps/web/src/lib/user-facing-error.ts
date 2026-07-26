import axios from 'axios';

export interface IApiErrorPayload {
  success?: false;
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
  API_ROUTE_NOT_FOUND: "We couldn't find the requested service. Refresh the page and try again.",
  MALFORMED_JSON: 'The submitted information could not be read. Refresh the page and try again.',
  FILE_TOO_LARGE: 'The selected file is too large. Choose a smaller file and try again.',
  UPLOAD_ERROR: 'The selected file could not be uploaded. Check the file and try again.',
  DUPLICATE_RESOURCE: 'That information is already in use.',
  SERVICE_UNAVAILABLE: 'This service is temporarily unavailable. Please try again shortly.',
  FEATURE_TEMPORARILY_UNAVAILABLE:
    'This area is temporarily paused for maintenance. Your existing information is safe.',
};

const STATUS_MESSAGES: Partial<Record<number, string>> = {
  400: 'The request could not be processed. Check the information and try again.',
  401: ERROR_MESSAGES.UNAUTHORIZED,
  403: ERROR_MESSAGES.FORBIDDEN,
  404: "We couldn't find what you requested. It may have moved or no longer exists.",
  408: 'The request took too long. Please try again.',
  409: 'This action conflicts with the latest information. Refresh and try again.',
  413: ERROR_MESSAGES.FILE_TOO_LARGE,
  422: 'Please check the submitted information and try again.',
  429: ERROR_MESSAGES.RATE_LIMITED,
  500: ERROR_MESSAGES.INTERNAL_ERROR,
  502: 'The service received an invalid response. Please try again shortly.',
  503: ERROR_MESSAGES.SERVICE_UNAVAILABLE,
  504: 'The service took too long to respond. Please try again shortly.',
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

  const { status } = error.response;
  const data =
    typeof error.response.data === 'object' && error.response.data !== null
      ? error.response.data
      : undefined;
  const errorCode = data?.code;
  const definedMessage = errorCode ? ERROR_MESSAGES[errorCode] : undefined;

  if (definedMessage) {
    if (errorCode === 'VALIDATION_ERROR') {
      return firstFieldError(data?.errors) ?? definedMessage;
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

  return STATUS_MESSAGES[status] ?? fallback;
};

export const getValidationErrors = (error: unknown): Record<string, string[]> => {
  if (!axios.isAxiosError<IApiErrorPayload>(error)) return {};
  return error.response?.data?.errors ?? {};
};
