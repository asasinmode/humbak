import { sql } from 'drizzle-orm';
import { boolean, datetime, int, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';
import * as v from 'valibot';
import { nonEmptyMaxLengthString, positiveIntegerValidation } from '../../helpers';

const defaultContent = `<div>
	<h3>Slide</h3>
</div>`;

export const slides = mysqlTable('slides', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 256 }).notNull(),
	rawContent: text('rawContent').notNull().default(defaultContent),
	parsedContent: text('parsedContent').notNull().default(defaultContent),
	isHidden: boolean('isHidden').notNull().default(false),
	language: varchar('language', { length: 32 }).notNull(),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertSlideSchema = v.object({
	id: v.optional(positiveIntegerValidation),
	name: nonEmptyMaxLengthString(),
	language: nonEmptyMaxLengthString(32),
	content: v.optional(v.string('musi być tekstem')),
	isHidden: v.boolean('musi być true lub false'),
});
