import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';

import type { ErrorKind, IKindedError } from '../errors/error-kind';
import { ApiError } from '../utils/api-error';

type ErrorDetails = Record<string, string[]>;

type HttpOperationalError = Error & {
  statusCode: number;
  code: string;
  errors?: ErrorDetails;
  data?: Record<string, unknown>;
};

type ErrorResponse = {
  success: false;
  message: string;
  code: string;
  errors?: ErrorDetails;
  data?: Record<string, unknown>;
};

type UnknownErrorRecord = Record<string, unknown> & {
  name?: string;
  code?: string | number;
  status?: number;
  statusCode?: number;
  type?: string;
  path?: string;
  errors?: Record<string, { message?: string }>;
};

const errorRecord = (error: unknown): UnknownErrorRecord =>
  typeof error === 'object' && error !== null ? (error as UnknownErrorRecord) : {};

const formatZodErrors = (error: ZodError): ErrorDetails => {
  const errors: ErrorDetails = {};

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.map(String).join('.') : '_root';
    errors[field] = [...(errors[field] ?? []), issue.message];
  }

  return errors;
};

const isHttpOperationalError = (error: unknown): error is HttpOperationalError => {
  if (!(error instanceof Error)) return false;
  const possibleError = error as Partial<HttpOperationalError>;

  return (
    typeof possibleError.statusCode === 'number' &&
    Number.isInteger(possibleError.statusCode) &&
    possibleError.statusCode >= 400 &&
    possibleError.statusCode <= 599 &&
    typeof possibleError.code === 'string'
  );
};

const safeOperationalMessage = (statusCode: number, message: string): string =>
  statusCode >= 500 ? 'Something went wrong on our side. Please try again.' : message;

const ERROR_KIND_STATUS: Record<ErrorKind, number> = {
  'invalid-input': 400,
  unauthenticated: 401,
  forbidden: 403,
  'missing-resource': 404,
  conflict: 409,
  'rate-limited': 429,
  'dependency-failure': 502,
  'dependency-unavailable': 503,
  internal: 500,
};

const isKindedError = (error: unknown): error is IKindedError => {
  if (!(error instanceof Error)) return false;
  const possibleError = error as Partial<IKindedError>;

  return (
    typeof possibleError.code === 'string' &&
    typeof possibleError.kind === 'string' &&
    Object.hasOwn(ERROR_KIND_STATUS, possibleError.kind)
  );
};

const malformedJsonResponse = (): ErrorResponse => ({
  success: false,
  message: 'The request contains malformed JSON. Check the request body and try again.',
  code: 'MALFORMED_JSON',
});

const mongooseErrorResponse = (
  error: unknown
): { statusCode: number; body: ErrorResponse } | null => {
  const record = errorRecord(error);

  if (record.name === 'ValidationError' && record.errors) {
    const errors = Object.fromEntries(
      Object.entries(record.errors).map(([field, detail]) => [
        field,
        [detail.message?.trim() || 'This value is invalid.'],
      ])
    );

    return {
      statusCode: 400,
      body: {
        success: false,
        message: 'Please check the submitted information and try again.',
        code: 'DATABASE_VALIDATION_ERROR',
        errors,
      },
    };
  }

  if (record.name === 'CastError') {
    const field = typeof record.path === 'string' ? record.path : '_root';
    return {
      statusCode: 400,
      body: {
        success: false,
        message: 'One of the supplied identifiers or values is invalid.',
        code: 'INVALID_VALUE',
        errors: { [field]: ['This value has an invalid format.'] },
      },
    };
  }

  if (record.code === 11000) {
    return {
      statusCode: 409,
      body: {
        success: false,
        message: 'A record with the same unique information already exists.',
        code: 'DUPLICATE_RESOURCE',
      },
    };
  }

  return null;
};

const multerErrorResponse = (error: MulterError): { statusCode: number; body: ErrorResponse } => {
  const fileTooLarge = error.code === 'LIMIT_FILE_SIZE';

  return {
    statusCode: fileTooLarge ? 413 : 400,
    body: {
      success: false,
      message: fileTooLarge
        ? 'The selected file is too large. Choose a smaller file and try again.'
        : 'The selected file could not be uploaded. Check the file and try again.',
      code: fileTooLarge ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR',
    },
  };
};

const HTTP_ERROR_MESSAGES: Partial<Record<number, string>> = {
  400: 'The request could not be processed. Check the information and try again.',
  401: 'Authentication is required to continue.',
  403: 'You do not have permission to perform this action.',
  404: "We couldn't find what you requested.",
  405: 'This action is not supported for the requested endpoint.',
  408: 'The request took too long. Please try again.',
  409: 'This action conflicts with the latest information. Refresh and try again.',
  413: 'The request is too large. Submit less information or a smaller file and try again.',
  415: 'The request format is not supported.',
  422: 'Please check the submitted information and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
};

const httpStatusErrorResponse = (
  error: unknown
): { statusCode: number; body: ErrorResponse } | null => {
  const record = errorRecord(error);
  const statusCode = record.statusCode ?? record.status;

  if (
    typeof statusCode !== 'number' ||
    !Number.isInteger(statusCode) ||
    statusCode < 400 ||
    statusCode > 599
  ) {
    return null;
  }

  return {
    statusCode,
    body: {
      success: false,
      message:
        statusCode >= 500
          ? 'Something went wrong on our side. Please try again.'
          : (HTTP_ERROR_MESSAGES[statusCode] ?? 'The request could not be completed.'),
      code: `HTTP_${statusCode}`,
    },
  };
};

const isMalformedJsonError = (error: unknown): boolean => {
  const record = errorRecord(error);
  return (
    error instanceof SyntaxError &&
    (record.status === 400 || record.statusCode === 400 || record.type === 'entity.parse.failed')
  );
};

export const apiNotFoundHandler: RequestHandler = (_req, _res, next) => {
  next(
    new ApiError(
      404,
      "We couldn't find the requested API endpoint. Check the address and try again.",
      'API_ROUTE_NOT_FOUND'
    )
  );
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Please check the submitted information and try again.',
      code: 'VALIDATION_ERROR',
      errors: formatZodErrors(error),
    } satisfies ErrorResponse);
    return;
  }

  if (isMalformedJsonError(error)) {
    res.status(400).json(malformedJsonResponse());
    return;
  }

  if (error instanceof MulterError) {
    const mapped = multerErrorResponse(error);
    res.status(mapped.statusCode).json(mapped.body);
    return;
  }

  if (isKindedError(error)) {
    const statusCode = ERROR_KIND_STATUS[error.kind];
    if (statusCode >= 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: error.publicMessage ?? safeOperationalMessage(statusCode, error.message),
      code: error.code,
      ...(error.data ? { data: error.data } : {}),
    } satisfies ErrorResponse);
    return;
  }

  if (isHttpOperationalError(error)) {
    res.status(error.statusCode).json({
      success: false,
      message: safeOperationalMessage(error.statusCode, error.message),
      code: error.code,
      ...(error.errors ? { errors: error.errors } : {}),
      ...(error.data ? { data: error.data } : {}),
    } satisfies ErrorResponse);
    return;
  }

  const httpError = httpStatusErrorResponse(error);
  if (httpError) {
    if (httpError.statusCode >= 500) console.error(error);
    res.status(httpError.statusCode).json(httpError.body);
    return;
  }

  const databaseError = mongooseErrorResponse(error);
  if (databaseError) {
    res.status(databaseError.statusCode).json(databaseError.body);
    return;
  }

  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on our side. Please try again.',
    code: 'INTERNAL_ERROR',
  } satisfies ErrorResponse);
};
