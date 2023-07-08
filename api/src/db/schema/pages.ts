import { type InferModel, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { datetime, index, int, mysqlTable, uniqueIndex, varchar } from 'drizzle-orm/mysql-core';

export const pages = mysqlTable('pages', {
	id: int('id').primaryKey().autoincrement(),
	language: varchar('language', { length: 32 }).notNull(),
	title: varchar('title', { length: 256 }).notNull(),
	slug: varchar('slug', { length: 256 }).notNull(),
	menuText: varchar('menuText', { length: 256 }).notNull(),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
}, table => ({
	languageIndex: index('languageIndex').on(table.language),
	titleIndex: uniqueIndex('titleIndex').on(table.title),
}));

export type Page = InferModel<typeof pages, 'select'>;

export const insertPageSchema = createInsertSchema(pages, {
	language: schema => schema.language.nonempty(),
	title: schema => schema.title.nonempty(),
	slug: schema => schema.slug.nonempty(),
	menuText: schema => schema.menuText.nonempty(),
}).omit({ id: true, createdAt: true, updatedAt: true });
