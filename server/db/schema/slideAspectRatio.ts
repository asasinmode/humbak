import { sql } from 'drizzle-orm';
import { datetime, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

// slide migration should have
// INSERT INTO slideAspectRatio (value) VALUES ('1 / 3')
export const slideAspectRatio = mysqlTable('slideAspectRatio', {
	value: varchar('value', { length: 256 }).notNull(),
	updatedAt: datetime('updatedAt').notNull().default(sql`NOW()`),
});
