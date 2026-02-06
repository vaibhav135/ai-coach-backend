/**
 * Authentication middleware
 * Verifies JWT and attaches user to context
 */

import type { Context, Next } from 'hono'
import { UnauthorizedError } from '@/lib/errors.js'
import { type JWTPayload, verifyJWT } from '@/lib/jwt.js'

// Extend Hono's context variables
declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload
  }
}

/**
 * Require authentication middleware
 * Extracts JWT from Authorization header and verifies it
 */
export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header')
  }

  const token = authHeader.slice(7) // Remove 'Bearer ' prefix
  const payload = await verifyJWT(token)

  if (!payload) {
    throw new UnauthorizedError('Invalid or expired token')
  }

  // Attach user to context
  c.set('user', payload)

  await next()
}
