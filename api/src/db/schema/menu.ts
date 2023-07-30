import { type InferModel, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { boolean, datetime, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { pages } from './pages';

export const menus = mysqlTable('menus', {
	pageId: int('pageId').primaryKey().references(() => pages.id, { onDelete: 'cascade' }),
	text: varchar('text', { length: 256 }).notNull(),
	visible: boolean('visible').notNull().default(true),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export type Page = InferModel<typeof pages, 'select'>;

export const insertMenuSchema = createInsertSchema(menus, {
	text: schema => schema.text.nonempty(),
}).omit({ updatedAt: true });
