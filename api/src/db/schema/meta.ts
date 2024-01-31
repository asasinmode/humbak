import { sql } from 'drizzle-orm';
import { datetime, json, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { array, object, record, string } from 'valibot';
import { nonEmptyMaxLengthString } from '../../helpers';

const defaultMeta = [{ name: 'robots', content: 'index, follow' }];

export const meta = mysqlTable('meta', {
	language: varchar('language', { length: 32 }).primaryKey().notNull(),
	value: json('meta').$type<Record<string, string>[]>().notNull().default(defaultMeta),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertMetaSchema = object({
	language: nonEmptyMaxLengthString(32),
	value: array(record(string())),
});
