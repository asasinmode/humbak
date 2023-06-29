import { sql } from 'drizzle-orm';
import { datetime, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const pages = mysqlTable('pages', {
	id: int('id').primaryKey().autoincrement(),
	title: varchar('title', { length: 256 }).notNull(),
	slug: varchar('slug', { length: 256 }).notNull(),
	menuText: varchar('menuText', { length: 256 }).notNull(),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('createdAt').notNull().default(sql`NOW()`),
});
