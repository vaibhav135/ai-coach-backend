# AI Coach Backend

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Hono
- **Database**: PostgreSQL with pgvector
- **ORM**: Drizzle
- **Real-time**: LiveKit (server SDK + agents)
- **AI**: OpenAI (via LiveKit agents plugin)
- **Linting**: Biome

## Project Conventions

- **Path aliases**: Use `@/` for imports from `src/` (e.g., `@/lib/env.js`)
- **File naming**: kebab-case for files, PascalCase for classes/types
- **Imports**: Auto-sorted by Biome (don't manually organize)
- **Extensions**: Always use `.js` extension in imports (ESM requirement)

## TypeScript Rules

- Prefer inferred types over explicit annotations when possible
- Use `unknown` over `any`, narrow with type guards
- Use Zod for runtime validation, infer TS types from schemas
- Let Drizzle infer types: `typeof table.$inferSelect`, `typeof table.$inferInsert`
- Avoid complex generics - keep types simple and readable
- Use `as const` for literal types

## Error Handling

- Throw `AppError` subclasses from `@/lib/errors.js`:
  - `BadRequestError` (400) - invalid input
  - `UnauthorizedError` (401) - auth required
  - `ForbiddenError` (403) - no permission
  - `NotFoundError` (404) - resource missing
  - `ValidationError` (422) - validation failed
  - `InternalError` (500) - server error
- Operational errors: expected, handleable (`isOperational: true`)
- Programmer errors: bugs, should crash (`isOperational: false`)
- All errors caught by `@/middleware/error-handler.js`

## Hono Patterns

### Inline handlers for type inference

```ts
// Good - full type inference
app.get('/books/:id', (c) => {
  const id = c.req.param('id') // Inferred correctly
  return c.json({ id })
})
```

### Separate handlers with factory

```ts
import { createFactory } from 'hono/factory'
const factory = createFactory()
const handlers = factory.createHandlers(logger(), (c) => c.json(c.var.foo))
app.get('/api', ...handlers)
```

### Route separation with `app.route()`

```ts
// routes/users.ts
const app = new Hono()
  .get('/', (c) => c.json('list'))
  .get('/:id', (c) => c.json(c.req.param('id')))
export default app

// index.ts
app.route('/users', users)
```

### RPC types - chain methods and export type

```ts
const app = new Hono().get('/', (c) => c.json('ok')).post('/', (c) => c.json('created'))
export type AppType = typeof app
```

## Drizzle Patterns

- Define tables in `src/db/schema/*.ts`, re-export from `index.ts`
- Use `$inferSelect` and `$inferInsert` for types
- snake_case in DB, camelCase in TypeScript (automatic via `casing: 'snake_case'`)
- Run `npm run db:push` for dev, `npm run db:migrate` for production

## Node.js Patterns

- Async/await everywhere - no callbacks
- Fail fast on startup - validate env vars immediately (see `@/lib/env.js`)
- Use `node:` prefix for built-in modules (e.g., `import { readFile } from 'node:fs/promises'`)
- Centralized error handling - don't catch errors in individual routes

## Commands

```bash
# Development
npm run dev          # Start API server
npm run dev:agent    # Start LiveKit agent worker

# Database
docker compose up -d # Start PostgreSQL
npm run db:push      # Push schema to DB
npm run db:studio    # Open Drizzle Studio

# Quality
npm run typecheck    # Type check
npm run lint         # Lint + format check
npm run lint:fix     # Auto-fix issues
```
