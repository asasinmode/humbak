import { sql } from 'drizzle-orm';
import { datetime, int, json, mysqlTable, text } from 'drizzle-orm/mysql-core';
import { array, integer, number, object, optional, record, string } from 'valibot';
import { pages } from './pages';

const defaultHtml = `<section>
	<h1>Nagłówek</h1>
</section>`;
const defaultMeta = [{ name: 'description', content: '' }, { name: 'abstract', content: '' }];

export const contents = mysqlTable('contents', {
	pageId: int('pageId').primaryKey().references(() => pages.id, { onDelete: 'cascade' }),
	rawHtml: text('rawHtml').notNull().default(defaultHtml),
	parsedHtml: text('parsedHtml').notNull().default(defaultHtml),
	meta: json('meta').$type<Record<string, string>[]>().notNull().default(defaultMeta),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertContentSchema = object({
	pageId: optional(number([integer()])),
	html: optional(string()),
	meta: optional(array(record(string()))),
});
