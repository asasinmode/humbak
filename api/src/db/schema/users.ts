import { type InferModel, sql } from 'drizzle-orm';
import { datetime, int, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: int('id').primaryKey().autoincrement(),
	username: varchar('username', { length: 256 }).notNull(),
	password: text('password').notNull(),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export type User = InferModel<typeof users, 'select'>;
