# AI Coach Backend

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Hono
- **Database**: PostgreSQL with pgvector
- **Real-time**: LiveKit (server SDK + agents)
- **AI**: OpenAI (via LiveKit agents plugin)

## Hono Best Practices

### Don't create "Controllers" when possible

Write handlers directly after path definitions for proper type inference:

```ts
// Bad - can't infer path params
const bookPermalink = (c: Context) => {
  const id = c.req.param('id') // No type inference
  return c.json(`get ${id}`)
}
app.get('/books/:id', bookPermalink)

// Good - full type inference
app.get('/books/:id', (c) => {
  const id = c.req.param('id') // Inferred correctly
  return c.json(`get ${id}`)
})
```

### If you need separate handlers, use `factory.createHandlers()`

```ts
import { createFactory } from 'hono/factory'

const factory = createFactory()

const handlers = factory.createHandlers(logger(), (c) => {
  return c.json(c.var.foo)
})

app.get('/api', ...handlers)
```

### Building larger applications with `app.route()`

Separate routes into files, each exporting a Hono app:

```ts
// routes/authors.ts
import { Hono } from 'hono'

const app = new Hono()
  .get('/', (c) => c.json('list authors'))
  .post('/', (c) => c.json('create an author', 201))
  .get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
```

```ts
// index.ts
import { Hono } from 'hono'
import authors from './routes/authors'
import books from './routes/books'

const app = new Hono()

app.route('/authors', authors)
app.route('/books', books)

export default app
```

### For RPC features, chain methods and export type

```ts
// routes/authors.ts
const app = new Hono()
  .get('/', (c) => c.json('list authors'))
  .post('/', (c) => c.json('create an author', 201))

export default app
export type AppType = typeof app
```

```ts
// client usage
import type { AppType } from './routes/authors'
import { hc } from 'hono/client'

const client = hc<AppType>('http://localhost') // Fully typed
```

## Commands

```bash
# Start PostgreSQL
docker compose up -d

# Stop PostgreSQL
docker compose down
```
