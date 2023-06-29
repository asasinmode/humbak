import { sql } from 'drizzle-orm';
import { boolean, datetime, int, mysqlTable, primaryKey, text, varchar } from 'drizzle-orm/mysql-core';
import { pages } from './pages';

export const contents = mysqlTable('contents', {
	pageId: int('id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
	// @TODO check if varchar length means 32 characters or bytes or what
	language: varchar('language', { length: 32 }).notNull(),
	value: text('value'),
	meta: text('meta'),
	visible: boolean('visible').notNull().default(true),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('createdAt').notNull().default(sql`NOW()`),
}, table => ({
	pk: primaryKey(table.pageId, table.language),
}));
