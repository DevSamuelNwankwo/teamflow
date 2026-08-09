import type { AuthError } from '@supabase/supabase-js'

/** Normalized application error surfaced to the UI — never a raw Postgrest/Auth error shape. */
export class AppError extends Error {
  cause?: unknown
  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'AppError'
    this.cause = cause
  }
}

interface PostgrestLikeError {
  message: string
  code?: string
  details?: string | null
}

function isPostgrestLikeError(error: unknown): error is PostgrestLikeError {
  return typeof error === 'object' && error !== null && 'message' in error
}

const AUTH_MESSAGE_OVERRIDES: Record<string, string> = {
  'Invalid login credentials': 'Incorrect email or password. Please try again.',
  'User already registered': 'An account with this email already exists. Try logging in instead.',
  'Email not confirmed': 'Please confirm your email address before logging in.',
}

const POSTGRES_CODE_OVERRIDES: Record<string, string> = {
  '23505': 'That value is already in use — please choose another.',
  '23503': 'This action references data that no longer exists.',
  '23514': 'That value doesn’t meet the required constraints (check dates/fields).',
  PGRST301: 'Your session has expired. Please log in again.',
}

/** Turns a Supabase (Postgrest/Auth) error, or any thrown value, into a readable message
 *  suitable for a toast or inline form error — never leaks raw SQL/driver text to the user. */
export function getReadableError(error: unknown): string {
  if (error instanceof AppError) return error.message

  if (isAuthError(error)) {
    return AUTH_MESSAGE_OVERRIDES[error.message] ?? error.message
  }

  if (isPostgrestLikeError(error)) {
    if (error.code && POSTGRES_CODE_OVERRIDES[error.code]) {
      return POSTGRES_CODE_OVERRIDES[error.code]
    }
    return error.message
  }

  if (error instanceof Error) {
    if (error.message === 'Failed to fetch') {
      return 'Network error — please check your connection and try again.'
    }
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

function isAuthError(error: unknown): error is AuthError {
  return typeof error === 'object' && error !== null && 'name' in error && (error as { name?: string }).name === 'AuthApiError'
}
