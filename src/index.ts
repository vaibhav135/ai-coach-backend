/**
 * Application entry point
 * Environment is validated at import time (fail-fast pattern)
 */

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { env } from '@/lib/env.js'
import { errorHandler, notFoundHandler } from '@/middleware/error-handler.js'

const app = new Hono()

// Global error handlers
app.onError(errorHandler)
app.notFound(notFoundHandler)

// Routes
app.get('/', (c) => {
  return c.json({ message: 'AI Coach Backend' })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

console.log(`Server running on http://localhost:${env.PORT}`)

serve({
  fetch: app.fetch,
  port: env.PORT,
})

export default app
