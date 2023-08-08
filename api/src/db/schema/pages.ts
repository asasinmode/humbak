import { sql } from 'drizzle-orm';
import { integer, maxLength, minLength, number, object, optional, string } from 'valibot';
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
	id: optional(number([integer()])),
	language: string([minLength(1, 'nie może być puste'), maxLength(32, 'maksymalna długość: 32')]),
	title: string([minLength(1, 'nie może być puste'), maxLength(256, 'maksymalna długość: 256')]),
	slug: string([minLength(1, 'nie może być puste'), maxLength(256, 'maksymalna długość: 256')]),
});
