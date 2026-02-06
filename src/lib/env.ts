/**
 * Type-safe environment variable validation
 * Follows Node.js best practice #1.4: fail fast on missing config
 *
 * @see https://github.com/goldbergyoni/nodebestpractices#-14-use-environment-aware-secure-and-hierarchical-config
 */

import 'dotenv/config'

function required(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function optional(key: string): string | undefined
function optional(key: string, defaultValue: string): string
function optional(key: string, defaultValue?: string): string | undefined {
  return process.env[key] ?? defaultValue
}

export const env = {
  // Node environment
  NODE_ENV: optional('NODE_ENV', 'development'),
  isDev: optional('NODE_ENV', 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // Server
  PORT: Number(optional('PORT', '3000')),

  // Database
  DATABASE_URL: required('DATABASE_URL'),

  // Google OAuth
  GOOGLE_CLIENT_ID: required('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: required('GOOGLE_CLIENT_SECRET'),

  // JWT
  JWT_SECRET: required('JWT_SECRET'),

  // LiveKit (optional for now - required when using agents)
  LIVEKIT_URL: optional('LIVEKIT_URL'),
  LIVEKIT_API_KEY: optional('LIVEKIT_API_KEY'),
  LIVEKIT_API_SECRET: optional('LIVEKIT_API_SECRET'),

  // OpenAI (optional for now - required when using agents)
  OPENAI_API_KEY: optional('OPENAI_API_KEY'),
} as const

// Validate all env vars at import time (fail fast)
// This line ensures the object is evaluated when the module loads
export type Env = typeof env
