/**
 * Centralized error handler middleware for Hono
 *
 * @see https://github.com/goldbergyoni/nodebestpractices#-24-handle-errors-centrally-not-within-a-middleware
 */

import type { Context } from 'hono'
import { env } from '@/lib/env.js'
import { AppError, isOperationalError, ValidationError } from '@/lib/errors.js'

interface ErrorResponse {
  error: {
    message: string
    code: string
    errors?: Record<string, string[]>
    stack?: string
  }
}

/**
 * Hono error handler - use with app.onError()
 */
export function errorHandler(err: Error, c: Context): Response {
  // Log the error
  console.error('[Error]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    cause: err.cause,
  })

  // Handle known operational errors
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      error: {
        message: err.message,
        code: err.code,
      },
    }

    // Include validation errors if present
    if (err instanceof ValidationError) {
      response.error.errors = err.errors
    }

    // Include stack trace in development
    if (env.isDev) {
      response.error.stack = err.stack
    }

    return c.json(response, err.statusCode as 400)
  }

  // Handle unknown errors
  const isOperational = isOperationalError(err)

  // For non-operational errors in production, don't leak details
  const message =
    isOperational || env.isDev ? err.message : 'An unexpected error occurred'

  const response: ErrorResponse = {
    error: {
      message,
      code: 'INTERNAL_ERROR',
    },
  }

  if (env.isDev) {
    response.error.stack = err.stack
  }

  return c.json(response, 500)
}

/**
 * Not found handler - use with app.notFound()
 */
export function notFoundHandler(c: Context): Response {
  return c.json(
    {
      error: {
        message: `Route ${c.req.method} ${c.req.path} not found`,
        code: 'NOT_FOUND',
      },
    },
    404,
  )
}
