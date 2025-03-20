import { sql } from 'drizzle-orm';
import { datetime, index, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import * as v from 'valibot';
import { nonEmptyMaxLengthString, positiveIntegerValidation } from '../../validation';

export const pages = mysqlTable('pages', {
	id: int('id').primaryKey().autoincrement(),
	language: varchar('language', { length: 32 }).notNull(),
	title: varchar('title', { length: 256 }).notNull(),
	slug: varchar('slug', { length: 256 }).notNull(),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
}, table => [
	index('languageIndex').on(table.language),
]);

export const insertPageSchema = v.object({
	id: v.optional(positiveIntegerValidation),
	language: nonEmptyMaxLengthString(32),
	title: nonEmptyMaxLengthString(),
	slug: v.pipe(v.string(), v.maxLength(256)),
});
