import { sql } from 'drizzle-orm';
import { type AnyMySqlColumn, datetime, int, mysqlTable, text } from 'drizzle-orm/mysql-core';
import { integer, number, object, optional, string } from 'valibot';
import { directories } from './directories';

export const files = mysqlTable('files', {
	id: int('id').primaryKey(),
	parentId: int('directoryId').references((): AnyMySqlColumn => directories.id),
	path: text('path').notNull().default(''),
	name: text('name').notNull(),
	title: text('title').notNull(),
	alt: text('alt').notNull(),
	mimetype: text('mimetype').notNull(),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
});

export const insertDirectorySchema = object({
	parentId: optional(number([integer()])),
	name: string(),
	path: optional(string()),
});
