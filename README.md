# AI Coach Backend

Real-time AI coaching platform built with Node.js, Hono, and LiveKit.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Development](#development)
- [Docker](#docker)
- [Best Practices](#best-practices)
- [License](#license)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: [Hono](https://hono.dev/)
- **Database**: PostgreSQL with [pgvector](https://github.com/pgvector/pgvector)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Real-time**: [LiveKit](https://livekit.io/) (server SDK + agents)
- **AI**: OpenAI (via LiveKit agents plugin)
- **Linting**: [Biome](https://biomejs.dev/)

## Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)
- LiveKit Cloud account (or self-hosted)
- OpenAI API key

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `LIVEKIT_URL` | LiveKit server URL (e.g., `wss://your-project.livekit.cloud`) |
| `LIVEKIT_API_KEY` | LiveKit API key |
| `LIVEKIT_API_SECRET` | LiveKit API secret |
| `OPENAI_API_KEY` | OpenAI API key |

### 3. Start the database

```bash
docker compose up -d
```

### 4. Push the schema to the database

```bash
npm run db:push
```

### 5. Start the dev server

```bash
npm run dev
```

The server will start at `http://localhost:3000`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API server with hot reload |
| `npm run dev:agent` | Start LiveKit agent worker with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run typecheck` | Type check without emitting |
| `npm run lint` | Check for lint/format issues |
| `npm run lint:fix` | Auto-fix lint/format issues |
| `npm run format` | Format code |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema to DB (dev only) |
| `npm run db:studio` | Open Drizzle Studio GUI |

## Project Structure

```
src/
├── agent/
│   └── worker.ts         # LiveKit agent worker (separate process)
├── db/
│   ├── index.ts          # Database connection
│   └── schema/
│       └── index.ts      # Schema exports (add tables here)
├── lib/
│   ├── env.ts            # Type-safe environment validation
│   └── errors.ts         # Custom error classes (AppError, etc.)
├── middleware/
│   └── error-handler.ts  # Centralized error handling
└── index.ts              # API server entry point

drizzle/                  # Generated migrations
drizzle.config.ts         # Drizzle Kit configuration
biome.json                # Biome linter/formatter config
```

## Development

### Path Aliases

Use `@/` to import from `src/`:

```typescript
// Instead of:
import { env } from '../../../lib/env.js'

// Use:
import { env } from '@/lib/env.js'
```

### Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

- 2 spaces for indentation
- Single quotes
- Semicolons only when necessary
- Auto-organized imports

### Pre-commit Hooks

On every commit, the following checks run automatically:

1. **TypeScript type check** - Catches type errors
2. **Biome lint + format** - Fixes style issues on staged files

### Error Handling

Use the custom error classes in `src/lib/errors.ts`:

```typescript
import { NotFoundError, BadRequestError } from '@/lib/errors.js'

app.get('/users/:id', async (c) => {
  const user = await findUser(c.req.param('id'))
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  return c.json(user)
})
```

Available error classes:

| Class | Status | Use Case |
|-------|--------|----------|
| `BadRequestError` | 400 | Invalid input |
| `UnauthorizedError` | 401 | Auth required |
| `ForbiddenError` | 403 | No permission |
| `NotFoundError` | 404 | Resource missing |
| `ConflictError` | 409 | State conflict |
| `ValidationError` | 422 | Validation failed |
| `RateLimitError` | 429 | Rate limited |
| `InternalError` | 500 | Server error |

### Adding a Database Table

1. Create a new file in `src/db/schema/` (e.g., `users.ts`):

```typescript
import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow().notNull(),
})

// Inferred types for insert/select
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

2. Export it from `src/db/schema/index.ts`:

```typescript
export * from './users.js'
```

3. Push to database:

```bash
npm run db:push
```

### Running the LiveKit Agent

The agent runs as a separate process from the API server:

```bash
# Terminal 1: API server
npm run dev

# Terminal 2: LiveKit agent
npm run dev:agent
```

## Docker

### Start PostgreSQL

```bash
docker compose up -d
```

### Stop PostgreSQL

```bash
docker compose down
```

### Stop and remove data

```bash
docker compose down -v
```

## Best Practices

### TypeScript

- **Prefer inferred types** - Let TypeScript infer types when obvious; don't over-annotate
- **Use `unknown` over `any`** - Narrow types with type guards instead of using `any`
- **Zod for runtime validation** - Use Zod schemas and infer TypeScript types from them
- **Let ORMs infer types** - Use `typeof table.$inferSelect` instead of manual interfaces
- **Avoid complex generics** - Keep types simple and readable; refactor if types get complicated
- **Use `as const`** - For literal types and immutable objects

### Node.js

- **Async/await everywhere** - No callbacks; use promises for async operations
- **Fail fast on startup** - Validate environment variables immediately (see `src/lib/env.ts`)
- **Use `node:` prefix** - For built-in modules (e.g., `import { readFile } from 'node:fs/promises'`)
- **Centralized error handling** - Don't try/catch in every route; let errors bubble to middleware
- **Structure by feature** - Group related files together, not by type (routes, controllers, etc.)

### Error Handling

- **Use custom error classes** - Throw `NotFoundError`, `BadRequestError`, etc. from `@/lib/errors.js`
- **Operational vs programmer errors**:
  - *Operational*: Expected errors (invalid input, not found) - handle gracefully
  - *Programmer*: Bugs (null reference, type errors) - crash and fix the code
- **Don't swallow errors** - Always log or rethrow; never catch and ignore
- **Include context** - Error messages should help debugging: what failed, why, and with what data

### Database (Drizzle)

- **One schema file per table** - Keep schemas in `src/db/schema/*.ts`
- **Export from barrel file** - Re-export all schemas from `src/db/schema/index.ts`
- **Use inferred types** - `$inferSelect` for reads, `$inferInsert` for writes
- **snake_case in DB** - Use `casing: 'snake_case'` in config; write camelCase in TypeScript
- **Use `db:push` for dev** - Fast iteration; use proper migrations (`db:migrate`) for production

### Hono

- **Inline handlers** - Write handlers directly after route definitions for type inference
- **Chain methods** - Use `app.get().post().put()` for proper RPC type inference
- **Use `app.route()`** - Split routes into separate files for larger apps
- **Export app type** - `export type AppType = typeof app` for typed clients

### General

- **Small functions** - Each function should do one thing well
- **Descriptive names** - Variables and functions should describe what they contain/do
- **Early returns** - Return early from functions to avoid deep nesting
- **No magic numbers** - Use named constants for non-obvious values

## License

MIT
