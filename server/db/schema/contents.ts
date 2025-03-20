import { sql } from 'drizzle-orm';
import { datetime, int, json, mysqlTable, text } from 'drizzle-orm/mysql-core';
import * as v from 'valibot';
import { positiveIntegerValidation } from '../../validation';
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

export const insertContentSchema = v.object({
	pageId: v.optional(positiveIntegerValidation),
	html: v.optional(v.string()),
	meta: v.optional(v.array(
		v.record(
			v.string('klucze muszą być tesktem'),
			v.string('wartości muszą być tesktem'),
		),
	)),
});
