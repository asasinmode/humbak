import { sql } from 'drizzle-orm';
import { type AnyMySqlColumn, datetime, int, mysqlTable, text } from 'drizzle-orm/mysql-core';
import { minLength, null_, number, object, string, union } from 'valibot';
import { directories } from './directories';

export const files = mysqlTable('files', {
	id: int('id').primaryKey().autoincrement(),
	directoryId: int('directoryId').references((): AnyMySqlColumn => directories.id),
	path: text('path').notNull().default(''),
	name: text('name').notNull(),
	title: text('title').notNull(),
	alt: text('alt').notNull(),
	mimetype: text('mimetype').notNull(),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertFileSchema = object({
	directoryId: union([number(), null_()]),
	name: string([minLength(1)]),
	alt: string(),
	title: string(),
	mimetype: string([minLength(1)]),
});
