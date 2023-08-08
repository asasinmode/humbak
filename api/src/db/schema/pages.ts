import { sql } from 'drizzle-orm';
import { integer, number, object, optional } from 'valibot';
import { datetime, index, int, mysqlTable, uniqueIndex, varchar } from 'drizzle-orm/mysql-core';
import { nonEmptyMaxLengthString } from '~/helpers';

export const pages = mysqlTable('pages', {
	id: int('id').primaryKey().autoincrement(),
	language: varchar('language', { length: 32 }).notNull(),
	title: varchar('title', { length: 256 }).notNull(),
	slug: varchar('slug', { length: 256 }).notNull(),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
}, table => ({
	languageIndex: index('languageIndex').on(table.language),
	titleIndex: uniqueIndex('titleIndex').on(table.title),
}));

export const insertPageSchema = object({
	id: optional(number([integer()])),
	language: nonEmptyMaxLengthString(32),
	title: nonEmptyMaxLengthString(256),
	slug: nonEmptyMaxLengthString(256),
});
