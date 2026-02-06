/**
 * Database connection using Drizzle ORM with node-postgres
 *
 * @see https://orm.drizzle.team/docs/get-started-postgresql
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '@/lib/env.js'
import * as schema from './schema/index.js'

/**
 * Drizzle database instance
 * - Uses snake_case mapping (camelCase in TS → snake_case in DB)
 * - Includes all schema for relational queries
 */
export const db = drizzle({
  connection: {
    connectionString: env.DATABASE_URL,
  },
  schema,
  casing: 'snake_case',
})

export type Database = typeof db
