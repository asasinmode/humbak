import { sql } from 'drizzle-orm';
import { datetime, json, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import * as v from 'valibot';
import { nonEmptyMaxLengthString } from '../../validation';

const defaultMeta = [{ name: 'robots', content: 'index, follow' }];

export const meta = mysqlTable('meta', {
	language: varchar('language', { length: 32 }).primaryKey().notNull(),
	value: json('meta').$type<Record<string, string>[]>().notNull().default(defaultMeta),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertMetaSchema = v.object({
	language: nonEmptyMaxLengthString(32),
	value: v.array(
		v.record(
			v.string('klucze muszą być tesktem'),
			v.string('wartości muszą być tesktem'),
		),
	),
});
