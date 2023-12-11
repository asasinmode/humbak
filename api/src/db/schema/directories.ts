import { sql } from 'drizzle-orm';
import { type AnyMySqlColumn, datetime, int, mysqlTable, text } from 'drizzle-orm/mysql-core';
import { integer, number, object, optional, string } from 'valibot';

export const directories = mysqlTable('directories', {
	id: int('id').primaryKey().autoincrement(),
	parentId: int('parentId').references((): AnyMySqlColumn => directories.id),
	path: text('path').notNull().default(''),
	name: text('name').notNull(),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertDirectorySchema = object({
	parentId: optional(number([integer()])),
	name: string(),
	path: optional(string()),
});
