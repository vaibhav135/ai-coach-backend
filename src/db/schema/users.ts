import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }),
  googleId: varchar({ length: 255 }).notNull().unique(),
  avatarUrl: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
