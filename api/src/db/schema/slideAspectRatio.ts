import { sql } from 'drizzle-orm';
import { object } from 'valibot';
import { datetime, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { nonEmptyMaxLengthString } from '~/helpers';

export const slideAspectRatio = mysqlTable('slideAspectRatio', {
	value: varchar('name', { length: 256 }).notNull(),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertSlideSchema = object({
	value: nonEmptyMaxLengthString(),
});
