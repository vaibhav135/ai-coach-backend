/**
 * Application entry point
 * Environment is validated at import time (fail-fast pattern)
 */

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { env } from '@/lib/env.js'
import { requireAuth } from '@/middleware/auth.js'
import { errorHandler, notFoundHandler } from '@/middleware/error-handler.js'
import auth from '@/routes/auth.js'

const app = new Hono()

// Global error handlers
app.onError(errorHandler)
app.notFound(notFoundHandler)

// Public routes
app.get('/', (c) => {
  return c.json({ message: 'AI Coach Backend' })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Auth routes
app.route('/auth', auth)

// Protected routes example
app.get('/me', requireAuth, (c) => {
  const user = c.get('user')
  return c.json({ user })
})

console.log(`Server running on http://localhost:${env.PORT}`)

serve({
  fetch: app.fetch,
  port: env.PORT,
})

export default app
