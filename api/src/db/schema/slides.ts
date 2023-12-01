import { sql } from 'drizzle-orm';
import { boolean, datetime, int, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';
import { boolean as booleanValidation, integer, number, object, optional, string } from 'valibot';
import { nonEmptyMaxLengthString } from '../../helpers';

const defaultContent = `<div>
	<h3>Slide</h3>
</div>`;

export const slides = mysqlTable('slides', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 256 }).notNull(),
	content: text('content').notNull().default(defaultContent),
	isHidden: boolean('isHidden').notNull().default(false),
	language: varchar('language', { length: 32 }).notNull(),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertSlideSchema = object({
	id: optional(number([integer()])),
	name: nonEmptyMaxLengthString(),
	language: nonEmptyMaxLengthString(32),
	content: optional(string()),
	isHidden: booleanValidation(),
});
