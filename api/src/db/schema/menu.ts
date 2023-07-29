import { type InferModel, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { datetime, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { pages } from './pages';

export const menus = mysqlTable('menus', {
	id: int('id').primaryKey().autoincrement(),
	pageId: int('pageId').notNull().references(() => pages.id, { onDelete: 'cascade' }),
	text: varchar('menuText', { length: 256 }).notNull(),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export type Page = InferModel<typeof pages, 'select'>;

export const insertMenuSchema = createInsertSchema(menus, {
	text: schema => schema.text.nonempty(),
}).omit({ updatedAt: true });
