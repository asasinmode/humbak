import { sql } from 'drizzle-orm';
import { boolean, datetime, int, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';
import { integer, number, object, optional, string } from 'valibot';
import { nonEmptyMaxLengthString } from '~/helpers';

const defaultContent = `<div>
	<h3>Slide</h3>
</div>`;

export const slides = mysqlTable('slides', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 256 }).notNull(),
	content: text('content').notNull().default(defaultContent),
	isHidden: boolean('isHidden').notNull().default(false),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertSlideSchema = object({
	id: optional(number([integer()])),
	name: nonEmptyMaxLengthString(256),
	content: optional(string()),
});
