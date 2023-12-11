import { sql } from 'drizzle-orm';
import { type AnyMySqlColumn, datetime, int, mysqlTable, text } from 'drizzle-orm/mysql-core';
import { integer, number, object, optional, string } from 'valibot';

export const directories = mysqlTable('directories', {
	id: int('id').primaryKey(),
	parentId: int('parentId').references((): AnyMySqlColumn => directories.id),
	name: text('name').notNull(),
	path: text('path').notNull().default(''),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
});

export const insertDirectorySchema = object({
	parentId: optional(number([integer()])),
	name: string(),
	path: optional(string()),
});
