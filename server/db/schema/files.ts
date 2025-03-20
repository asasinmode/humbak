import type { AnyMySqlColumn } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { datetime, int, mysqlTable, text } from 'drizzle-orm/mysql-core';
import * as v from 'valibot';
import { nonEmptyStringValidation, nullablePositiveIntegerValidation } from '../../validation';
import { directories } from './directories';

export const files = mysqlTable('files', {
	id: int('id').primaryKey().autoincrement(),
	directoryId: int('directoryId').references((): AnyMySqlColumn => directories.id, { onDelete: 'cascade' }),
	path: text('path').notNull(),
	name: text('name').notNull(),
	title: text('title').notNull(),
	alt: text('alt').notNull(),
	mimetype: text('mimetype').notNull(),
	width: int('width'),
	height: int('height'),
	createdAt: datetime('createdAt').notNull().default(sql`NOW()`),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});

export const insertFileSchema = v.object({
	directoryId: nullablePositiveIntegerValidation,
	name: nonEmptyStringValidation,
	alt: v.string(),
	title: v.string(),
	mimetype: nonEmptyStringValidation,
});
