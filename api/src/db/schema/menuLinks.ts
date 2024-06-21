import { sql } from 'drizzle-orm';
import { datetime, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import * as v from 'valibot';
import { nonEmptyMaxLengthString, nullablePositiveIntegerValidation } from '../../helpers';
import { pages } from './pages';

export const menuLinks = mysqlTable('menuLinks', {
	pageId: int('pageId').primaryKey().references(() => pages.id, { onDelete: 'cascade' }),
	text: varchar('text', { length: 256 }).notNull(),
	position: int('position').notNull(),
	parentId: int('parentId'),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertMenuLinkSchema = v.object({
	pageId: v.pipe(v.number('musi być liczbą'), v.integer('musi być liczbą całkowitą')),
	text: nonEmptyMaxLengthString(),
	position: v.pipe(v.number('musi być liczbą'), v.integer('musi być liczbą całkowitą')),
	parentId: nullablePositiveIntegerValidation,
});
