import { sql } from 'drizzle-orm';
import { type AnyMySqlColumn, datetime, int, mysqlTable, text } from 'drizzle-orm/mysql-core';
import * as v from 'valibot';
import { nonEmptyStringValidation, nullablePositiveIntegerValidation } from '../../helpers';

export const directories = mysqlTable('directories', {
	id: int('id').primaryKey().autoincrement(),
	parentId: int('parentId').references((): AnyMySqlColumn => directories.id, { onDelete: 'cascade' }),
	path: text('path').notNull(),
	name: text('name').notNull(),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertDirectorySchema = v.object({
	parentId: nullablePositiveIntegerValidation,
	name: nonEmptyStringValidation,
});
