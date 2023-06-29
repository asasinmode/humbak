import { sql } from 'drizzle-orm';
import { datetime, int, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: int('id').autoincrement().primaryKey(),
	username: varchar('username', { length: 256 }).primaryKey(),
	password: text('password').notNull(),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('createdAt').notNull().default(sql`NOW()`),
});
