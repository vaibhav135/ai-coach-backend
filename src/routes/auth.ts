/**
 * Authentication routes
 * - POST /auth/google - Exchange Google auth code for JWT
 */

import { eq } from 'drizzle-orm'
import { OAuth2Client } from 'google-auth-library'
import { Hono } from 'hono'
import { db } from '@/db/index.js'
import { users } from '@/db/schema/index.js'
import { env } from '@/lib/env.js'
import { BadRequestError, UnauthorizedError } from '@/lib/errors.js'
import { signJWT } from '@/lib/jwt.js'

const app = new Hono()

const googleClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  '', // redirect URI not needed for mobile auth code exchange
)

/**
 * POST /auth/google
 * Accepts Google serverAuthCode from Flutter app, exchanges for tokens, creates/finds user
 */
app.post('/google', async (c) => {
  const body = await c.req.json<{ code?: string; idToken?: string }>()

  let googleId: string
  let email: string
  let name: string | undefined
  let picture: string | undefined

  // Support both auth code (from Flutter) and idToken (for testing)
  if (body.code) {
    // Exchange auth code for tokens
    const { tokens } = await googleClient.getToken(body.code)

    if (!tokens.id_token) {
      throw new UnauthorizedError('Failed to get ID token from Google')
    }

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedError('Invalid Google token payload')
    }

    googleId = payload.sub
    email = payload.email
    name = payload.name
    picture = payload.picture
  } else if (body.idToken) {
    // Direct ID token verification (for testing or web)
    const ticket = await googleClient.verifyIdToken({
      idToken: body.idToken,
      audience: env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedError('Invalid Google token payload')
    }

    googleId = payload.sub
    email = payload.email
    name = payload.name
    picture = payload.picture
  } else {
    throw new BadRequestError('Missing code or idToken')
  }

  // Find or create user in database
  let user = await db.query.users.findFirst({
    where: eq(users.googleId, googleId),
  })

  if (!user) {
    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name: name ?? null,
        googleId,
        avatarUrl: picture ?? null,
      })
      .returning()

    user = newUser
  }

  // Generate JWT for our backend
  const accessToken = await signJWT({
    userId: user.id,
    email: user.email,
  })

  return c.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
  })
})

export default app
