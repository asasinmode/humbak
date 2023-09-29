import { sql } from 'drizzle-orm';
import { datetime, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const slideAspectRatio = mysqlTable('slideAspectRatio', {
	value: varchar('value', { length: 256 }).notNull(),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});
