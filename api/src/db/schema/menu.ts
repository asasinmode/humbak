import { type InferModel, sql } from 'drizzle-orm';
import { datetime, int, mysqlTable } from 'drizzle-orm/mysql-core';
import { pages } from './pages';

export const menus = mysqlTable('menus', {
	id: int('id').primaryKey().autoincrement(),
	pageId: int('pageId').notNull().references(() => pages.id, { onDelete: 'cascade' }),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export type Page = InferModel<typeof pages, 'select'>;
