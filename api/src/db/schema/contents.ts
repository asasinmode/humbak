import { type InferModel, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { datetime, int, json, mysqlTable, text } from 'drizzle-orm/mysql-core';
import { z } from 'zod';
import { pages } from './pages';

export const contents = mysqlTable('contents', {
	pageId: int('pageId').primaryKey().references(() => pages.id, { onDelete: 'cascade' }),
	html: text('html').notNull().default(''),
	meta: json('meta').$type<Record<string, string>[]>().notNull().default([]),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export type Content = InferModel<typeof contents>;

export const insertContentSchema = createInsertSchema(contents, {
	meta: () => z.array(z.object<Record<string, any>>({})),
}).omit({ updatedAt: true });
