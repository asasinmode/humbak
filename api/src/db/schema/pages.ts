import { sql } from 'drizzle-orm';
import { integer, maxLength, number, object, optional, string } from 'valibot';
import { datetime, index, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { nonEmptyMaxLengthString } from '../../helpers';

export const pages = mysqlTable('pages', {
	id: int('id').primaryKey().autoincrement(),
	language: varchar('language', { length: 32 }).notNull(),
	title: varchar('title', { length: 256 }).notNull(),
	slug: varchar('slug', { length: 256 }).notNull(),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
}, table => ({
	languageIndex: index('languageIndex').on(table.language),
}));

export const insertPageSchema = object({
	id: optional(number([integer()])),
	language: nonEmptyMaxLengthString(32),
	title: nonEmptyMaxLengthString(),
	slug: string([maxLength(256, `maksymalna długość: 256`)]),
});
