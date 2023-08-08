import { sql } from 'drizzle-orm';
import { integer, maxLength, number, object, string } from 'valibot';
import { datetime, index, int, mysqlTable, uniqueIndex, varchar } from 'drizzle-orm/mysql-core';

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
	id: number([integer()]),
	language: string([maxLength(32)]),
	title: string([maxLength(256)]),
	slug: string([maxLength(256)]),
});
