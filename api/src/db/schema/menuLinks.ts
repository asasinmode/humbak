import { sql } from 'drizzle-orm';
import { datetime, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { integer, maxLength, nullable, number, object, optional, string } from 'valibot';
import { pages } from './pages';

export const menuLinks = mysqlTable('menuLinks', {
	pageId: int('pageId').primaryKey().references(() => pages.id, { onDelete: 'cascade' }),
	text: varchar('text', { length: 256 }).notNull(),
	position: int('position').notNull(),
	parentId: int('parentId'),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertMenuLinkSchema = object({
	pageId: number([integer()]),
	text: string([maxLength(256)]),
	position: number([integer()]),
	parentId: optional(nullable(number())),
});
