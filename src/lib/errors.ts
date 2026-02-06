/**
 * Centralized error handling utilities
 *
 * @see https://github.com/goldbergyoni/nodebestpractices#-22-extend-the-built-in-error-object
 * @see https://github.com/goldbergyoni/nodebestpractices#-23-distinguish-catastrophic-errors-from-operational-errors
 */

/**
 * Base application error class
 * Extends built-in Error with additional context
 */
export class AppError extends Error {
  /** HTTP status code */
  readonly statusCode: number

  /** Error code for client-side handling */
  readonly code: string

  /**
   * Whether this is an operational error (expected, handleable)
   * vs a programmer error (bug, should crash)
   */
  readonly isOperational: boolean

  constructor(
    message: string,
    options: {
      statusCode?: number
      code?: string
      isOperational?: boolean
      cause?: Error
    } = {},
  ) {
    super(message, { cause: options.cause })

    this.name = this.constructor.name
    this.statusCode = options.statusCode ?? 500
    this.code = options.code ?? 'INTERNAL_ERROR'
    this.isOperational = options.isOperational ?? true

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * 400 Bad Request - Invalid input from client
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST', cause?: Error) {
    super(message, { statusCode: 400, code, isOperational: true, cause })
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
  constructor(
    message = 'Authentication required',
    code = 'UNAUTHORIZED',
    cause?: Error,
  ) {
    super(message, { statusCode: 401, code, isOperational: true, cause })
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access denied', code = 'FORBIDDEN', cause?: Error) {
    super(message, { statusCode: 403, code, isOperational: true, cause })
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(
    message = 'Resource not found',
    code = 'NOT_FOUND',
    cause?: Error,
  ) {
    super(message, { statusCode: 404, code, isOperational: true, cause })
  }
}

/**
 * 409 Conflict - Resource state conflict
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', code = 'CONFLICT', cause?: Error) {
    super(message, { statusCode: 409, code, isOperational: true, cause })
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 */
export class ValidationError extends AppError {
  readonly errors: Record<string, string[]>

  constructor(
    message = 'Validation failed',
    errors: Record<string, string[]> = {},
    cause?: Error,
  ) {
    super(message, {
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      isOperational: true,
      cause,
    })
    this.errors = errors
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends AppError {
  constructor(
    message = 'Too many requests',
    code = 'RATE_LIMIT_EXCEEDED',
    cause?: Error,
  ) {
    super(message, { statusCode: 429, code, isOperational: true, cause })
  }
}

/**
 * 500 Internal Server Error - Unexpected error
 * Mark isOperational=false for programmer errors that should crash the process
 */
export class InternalError extends AppError {
  constructor(
    message = 'Internal server error',
    isOperational = true,
    cause?: Error,
  ) {
    super(message, {
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      isOperational,
      cause,
    })
  }
}

/**
 * Check if error is operational (handleable) vs programmer error (bug)
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}
