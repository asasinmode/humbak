import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { datetime, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { pages } from './pages';

export const menuLinks = mysqlTable('menuLinks', {
	pageId: int('pageId').primaryKey().references(() => pages.id, { onDelete: 'cascade' }),
	text: varchar('text', { length: 256 }).notNull(),
	position: int('position').notNull(),
	parentId: int('parentId'),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertMenuLinkSchema = createInsertSchema(menuLinks, {
	text: schema => schema.text.nonempty(),
}).omit({ updatedAt: true });
