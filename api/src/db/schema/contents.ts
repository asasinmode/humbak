import { type InferModel, sql } from 'drizzle-orm';
import { boolean, datetime, int, json, mysqlTable, text } from 'drizzle-orm/mysql-core';
import { pages } from './pages';

export const contents = mysqlTable('contents', {
	id: int('id').primaryKey().autoincrement(),
	pageId: int('id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
	value: text('value').notNull().default(''),
	meta: json('meta').notNull().default([]),
	visible: boolean('visible').notNull().default(true),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export type Content = InferModel<typeof contents>;
