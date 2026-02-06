/**
 * JWT utilities using jose library
 */

import * as jose from 'jose'
import { env } from '@/lib/env.js'

const secret = new TextEncoder().encode(env.JWT_SECRET)
const alg = 'HS256'

export interface JWTPayload extends jose.JWTPayload {
  userId: string
  email: string
}

/**
 * Sign a JWT token
 */
export async function signJWT(payload: JWTPayload): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}
